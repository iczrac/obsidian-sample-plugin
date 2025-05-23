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
    static getGeJuInfo(geJu) {
        const explanations = {
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
    static getGeJuExplanation(geJu) {
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
    static analyzeGeJu(geJu, riZhuStrength) {
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
        let level = geJuInfo.type;
        // 根据格局类型和日主旺衰进行具体分析
        switch (geJu) {
            case '正印格':
            case '偏印格':
            case '印绶格':
                if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
                    analysis = `${geJu}配合日主偏弱，印星生助日主，格局良好。`;
                    suggestion = '建议发展教育、文化、行政等印星有利的事业。';
                    level = 'good';
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
    static analyzeDaYunEffect(geJu, daYunGanZhi, riZhuWuXing) {
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
        let level = 'neutral';
        // 根据格局类型和大运五行关系进行具体分析
        switch (geJu) {
            case '正印格':
            case '偏印格':
            case '印绶格':
                if (relationship === '生') {
                    effect = `大运五行${daYunWuXing}生日主五行${riZhuWuXing}，增强印星生助日主的力量，对${geJu}有利。`;
                    suggestion = '此大运期间，可以重点发展教育、文化、行政等印星有利的事业。';
                    level = 'good';
                }
                else if (relationship === '克') {
                    effect = `大运五行${daYunWuXing}克日主五行${riZhuWuXing}，削弱印星生助日主的力量，对${geJu}不利。`;
                    suggestion = '此大运期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
                    level = 'bad';
                }
                else if (relationship === '被生') {
                    effect = `大运五行${daYunWuXing}被日主五行${riZhuWuXing}所生，日主泄气过多，对${geJu}不利。`;
                    suggestion = '此大运期间，需要注意保存实力，避免过度付出，适当调整事业方向。';
                    level = 'bad';
                }
                else if (relationship === '被克') {
                    effect = `大运五行${daYunWuXing}被日主五行${riZhuWuXing}所克，日主得以发挥，对${geJu}中性影响。`;
                    suggestion = '此大运期间，可以适度发展事业，但需要注意平衡各方面的关系。';
                    level = 'neutral';
                }
                else {
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
    static getStemWuXing(stem) {
        const stemWuXingMap = {
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
    static analyzeLiuNianEffect(geJu, liuNianGanZhi, riZhuWuXing) {
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
        let level = 'neutral';
        // 根据格局类型和流年五行关系进行具体分析
        switch (geJu) {
            case '正印格':
            case '偏印格':
            case '印绶格':
                if (relationship === '生') {
                    effect = `流年五行${liuNianWuXing}生日主五行${riZhuWuXing}，增强印星生助日主的力量，对${geJu}有利。`;
                    suggestion = '此流年期间，可以重点发展教育、文化、行政等印星有利的事业。';
                    level = 'good';
                }
                else if (relationship === '克') {
                    effect = `流年五行${liuNianWuXing}克日主五行${riZhuWuXing}，削弱印星生助日主的力量，对${geJu}不利。`;
                    suggestion = '此流年期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
                    level = 'bad';
                }
                else if (relationship === '被生') {
                    effect = `流年五行${liuNianWuXing}被日主五行${riZhuWuXing}所生，日主泄气过多，对${geJu}不利。`;
                    suggestion = '此流年期间，需要注意保存实力，避免过度付出，适当调整事业方向。';
                    level = 'bad';
                }
                else if (relationship === '被克') {
                    effect = `流年五行${liuNianWuXing}被日主五行${riZhuWuXing}所克，日主得以发挥，对${geJu}中性影响。`;
                    suggestion = '此流年期间，可以适度发展事业，但需要注意平衡各方面的关系。';
                    level = 'neutral';
                }
                else {
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
                }
                else if (relationship === '克') {
                    effect = `流年五行${liuNianWuXing}克日主五行${riZhuWuXing}，增强官杀对日主的克制，对${geJu}不利。`;
                    suggestion = '此流年期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
                    level = 'bad';
                }
                else if (relationship === '生') {
                    effect = `流年五行${liuNianWuXing}生日主五行${riZhuWuXing}，增强日主力量，对${geJu}中性影响。`;
                    suggestion = '此流年期间，可以适度发展事业，但需要注意平衡各方面的关系。';
                    level = 'neutral';
                }
                else {
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
                }
                else if (relationship === '克') {
                    effect = `流年五行${liuNianWuXing}克日主五行${riZhuWuXing}，削弱日主对财官的控制，对${geJu}不利。`;
                    suggestion = '此流年期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
                    level = 'bad';
                }
                else {
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
    static analyzeGeJuTrend(geJu, riZhuWuXing, daYunList) {
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
            return Object.assign(Object.assign({}, effect), { startYear: daYun.startYear, endYear: daYun.endYear, ganZhi: daYun.ganZhi });
        });
        // 找出关键年份（大运交接年）
        const keyYears = daYunEffects.map((effect, index) => {
            if (index === 0) {
                return {
                    year: effect.startYear,
                    event: `进入${effect.ganZhi}大运，${effect.effect}`,
                    level: effect.level
                };
            }
            else {
                return {
                    year: effect.startYear,
                    event: `从${daYunEffects[index - 1].ganZhi}大运进入${effect.ganZhi}大运，${effect.effect}`,
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
        }
        else if (badDaYun > goodDaYun && badDaYun > neutralDaYun) {
            trend = `整体来看，${geJu}在未来大运中发展趋势不佳，需要注意调整和应对。`;
        }
        else {
            trend = `整体来看，${geJu}在未来大运中发展趋势起伏不定，需要根据具体大运灵活调整。`;
        }
        // 提供建议
        let suggestion = '';
        if (goodDaYun > badDaYun) {
            suggestion = `建议在有利大运期间积极发展事业，在不利大运期间注意调整和保守。特别是在${keyYears.filter(year => year.level === 'good').map(year => year.year).join('年、')}年等关键年份，可以有所作为。`;
        }
        else if (badDaYun > goodDaYun) {
            suggestion = `建议在不利大运期间保守行事，注意调整心态和方向。特别是在${keyYears.filter(year => year.level === 'bad').map(year => year.year).join('年、')}年等关键年份，需要特别谨慎。`;
        }
        else {
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
    static getWuXingRelationship(wuXing1, wuXing2) {
        if (wuXing1 === wuXing2) {
            return '同';
        }
        // 五行相生关系：木生火，火生土，土生金，金生水，水生木
        const shengRelations = {
            '木': '火',
            '火': '土',
            '土': '金',
            '金': '水',
            '水': '木'
        };
        // 五行相克关系：木克土，土克水，水克火，火克金，金克木
        const keRelations = {
            '木': '土',
            '土': '水',
            '水': '火',
            '火': '金',
            '金': '木'
        };
        if (shengRelations[wuXing1] === wuXing2) {
            return '生';
        }
        else if (keRelations[wuXing1] === wuXing2) {
            return '克';
        }
        else if (shengRelations[wuXing2] === wuXing1) {
            return '被生';
        }
        else if (keRelations[wuXing2] === wuXing1) {
            return '被克';
        }
        return '未知';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VKdVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJHZUp1U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sV0FBVztJQUN0Qjs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFZO1FBV3BDLE1BQU0sWUFBWSxHQVlkO1lBQ0YsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBRSxLQUFLO2dCQUNYLFdBQVcsRUFBRSx1REFBdUQ7Z0JBQ3BFLFNBQVMsRUFBRSwrQ0FBK0M7Z0JBQzFELE1BQU0sRUFBRSxzQ0FBc0M7Z0JBQzlDLE1BQU0sRUFBRSwwQkFBMEI7Z0JBQ2xDLFlBQVksRUFBRSw0QkFBNEI7Z0JBQzFDLE1BQU0sRUFBRSx5QkFBeUI7Z0JBQ2pDLElBQUksRUFBRSxNQUFNO2dCQUNaLE1BQU0sRUFBRSxlQUFlO2FBQ3hCO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBRSxLQUFLO2dCQUNYLFdBQVcsRUFBRSxvREFBb0Q7Z0JBQ2pFLFNBQVMsRUFBRSxzQ0FBc0M7Z0JBQ2pELE1BQU0sRUFBRSxpQ0FBaUM7Z0JBQ3pDLE1BQU0sRUFBRSwrQkFBK0I7Z0JBQ3ZDLFlBQVksRUFBRSx3QkFBd0I7Z0JBQ3RDLE1BQU0sRUFBRSxxQkFBcUI7Z0JBQzdCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxlQUFlO2FBQ3hCO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBRSxLQUFLO2dCQUNYLFdBQVcsRUFBRSxvREFBb0Q7Z0JBQ2pFLFNBQVMsRUFBRSxzQ0FBc0M7Z0JBQ2pELE1BQU0sRUFBRSxpQ0FBaUM7Z0JBQ3pDLE1BQU0sRUFBRSwyQkFBMkI7Z0JBQ25DLFlBQVksRUFBRSx5QkFBeUI7Z0JBQ3ZDLE1BQU0sRUFBRSw0QkFBNEI7Z0JBQ3BDLElBQUksRUFBRSxNQUFNO2dCQUNaLE1BQU0sRUFBRSxlQUFlO2FBQ3hCO1lBQ0QsS0FBSyxFQUFF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QUUsR0FBRztTQUNULENBQUM7UUFFRiw2QkFBNkI7UUFDN0IsTUFBTSxXQUFXLEdBQTRCO1lBQzNDLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7U0FDVCxDQUFDO1FBRUYsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssT0FBTyxFQUFFO1lBQ3ZDLE9BQU8sR0FBRyxDQUFDO1NBQ1o7YUFBTSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDM0MsT0FBTyxHQUFHLENBQUM7U0FDWjthQUFNLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLE9BQU8sRUFBRTtZQUM5QyxPQUFPLElBQUksQ0FBQztTQUNiO2FBQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssT0FBTyxFQUFFO1lBQzNDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog5qC85bGA5pyN5Yqh57G7XG4gKiDmj5DkvpvmoLzlsYDnmoTor6bnu4bop6Pph4rlkozliIbmnpBcbiAqL1xuZXhwb3J0IGNsYXNzIEdlSnVTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIOiOt+WPluagvOWxgOeahOivpue7huS/oeaBr1xuICAgKiBAcGFyYW0gZ2VKdSDmoLzlsYDlkI3np7BcbiAgICogQHJldHVybnMg5qC85bGA55qE6K+m57uG5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldEdlSnVJbmZvKGdlSnU6IHN0cmluZyk6IHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZXhwbGFuYXRpb246IHN0cmluZztcbiAgICBpbmZsdWVuY2U6IHN0cmluZztcbiAgICBjYXJlZXI6IHN0cmluZztcbiAgICBoZWFsdGg6IHN0cmluZztcbiAgICByZWxhdGlvbnNoaXA6IHN0cmluZztcbiAgICB3ZWFsdGg6IHN0cmluZztcbiAgICB0eXBlOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCc7XG4gICAgc291cmNlPzogc3RyaW5nO1xuICB9IHwgbnVsbCB7XG4gICAgY29uc3QgZXhwbGFuYXRpb25zOiB7XG4gICAgICBba2V5OiBzdHJpbmddOiB7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgZXhwbGFuYXRpb246IHN0cmluZztcbiAgICAgICAgaW5mbHVlbmNlOiBzdHJpbmc7XG4gICAgICAgIGNhcmVlcjogc3RyaW5nO1xuICAgICAgICBoZWFsdGg6IHN0cmluZztcbiAgICAgICAgcmVsYXRpb25zaGlwOiBzdHJpbmc7XG4gICAgICAgIHdlYWx0aDogc3RyaW5nO1xuICAgICAgICB0eXBlOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCc7XG4gICAgICAgIHNvdXJjZT86IHN0cmluZztcbiAgICAgIH1cbiAgICB9ID0ge1xuICAgICAgJ+ato+WNsOagvCc6IHtcbiAgICAgICAgbmFtZTogJ+ato+WNsOagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5q2j5Y2w5qC85piv5oyH5YWr5a2X5Lit5q2j5Y2w5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75YGP5byx77yM5Y+W5q2j5Y2w5Li655So56We55qE5qC85bGA44CC5q2j5Y2w5Luj6KGo5q+N5Lqy44CB5a2m5Lia44CB5paH5Yet44CB6LS15Lq644CB5pm65oWn562J44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5q2j5Y2w5qC855qE5Lq66YCa5bi46IGq5piO5aW95a2m77yM5oCn5qC85rip5ZKM77yM5pyJ5paH5YyW5L+u5YW777yM5b6X6ZW/6L6I5o+Q5pC677yM6YCC5ZCI5LuO5LqL5paH5YyW44CB5pWZ6IKy44CB6KGM5pS/562J5bel5L2c44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5pWZ6IKy44CB5paH5YyW44CB6KGM5pS/44CB5YWs5Yqh5ZGY44CB5Yy755Sf44CB5b6L5biI562J6ZyA6KaB5LiT5Lia55+l6K+G5ZKM5paH5Yet55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5byx77yM5a655piT5pyJ6IK66YOo44CB5ZG85ZC457O757uf55a+55eF77yM5bqU5rOo5oSP5L+d5YW744CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5LiO6ZW/6L6I5YWz57O76Imv5aW977yM5b6X5Yiw6ZW/6L6I5o+Q5pC677yM5L2G5Y+v6IO95a+55a2Q5aWz6L+H5LqO5Lil5qC844CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q56iz5a6a77yM5L2G5LiN5Lya5aSn5a+M5aSn6LS177yM6YCC5ZCI56iz5a6a5pS25YWl55qE5bel5L2c44CCJyxcbiAgICAgICAgdHlwZTogJ2dvb2QnLFxuICAgICAgICBzb3VyY2U6ICfjgIrmuIrmtbflrZDlubPjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+WBj+WNsOagvCc6IHtcbiAgICAgICAgbmFtZTogJ+WBj+WNsOagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5YGP5Y2w5qC85piv5oyH5YWr5a2X5Lit5YGP5Y2w5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75YGP5byx77yM5Y+W5YGP5Y2w5Li655So56We55qE5qC85bGA44CC5YGP5Y2w5Luj6KGo5pm65oWn44CB5a2m5pyv44CB5paH6Im644CB54G15oSf562J44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5YGP5Y2w5qC855qE5Lq66YCa5bi46IGq5piO54G156eA77yM5pyJ5paH6Im65aSp6LWL77yM5oCd57u05rS76LeD77yM5L2G5oCn5qC86L6D5Li65a2k5YKy77yM5LiN5ZaE5Lqk6ZmF44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5paH5a2m44CB6Im65pyv44CB6K6+6K6h44CB56CU56m244CB5a6X5pWZ562J6ZyA6KaB5Yib6YCg5Yqb5ZKM54G15oSf55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5byx77yM5a655piT5pyJ56We57uP57O757uf44CB57K+56We5pa56Z2i55qE6Zeu6aKY77yM5bqU5rOo5oSP6LCD6IqC5oOF57uq44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5Lq66ZmF5YWz57O76L6D5Li65reh6JaE77yM5LiN5ZaE5Lqk6ZmF77yM5L2G5pyJ5b+g5a6e55qE5pyL5Y+L44CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q5LiN56iz5a6a77yM5L2G5Y+v6IO95Zyo54m55a6a6aKG5Z+f5pyJ5omA5oiQ5bCx44CCJyxcbiAgICAgICAgdHlwZTogJ25ldXRyYWwnLFxuICAgICAgICBzb3VyY2U6ICfjgIrmuIrmtbflrZDlubPjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+ato+WumOagvCc6IHtcbiAgICAgICAgbmFtZTogJ+ato+WumOagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5q2j5a6Y5qC85piv5oyH5YWr5a2X5Lit5q2j5a6Y5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75pe655ub77yM5Y+W5q2j5a6Y5Li655So56We55qE5qC85bGA44CC5q2j5a6Y5Luj6KGo5p2D5aiB44CB6KeE55+p44CB57qq5b6L44CB6IGM5L2N562J44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5q2j5a6Y5qC855qE5Lq66YCa5bi45q2j55u05a6I6KeE77yM5pyJ6LSj5Lu75oSf77yM5YGa5LqL5pyJ5p2h55CG77yM6YCC5ZCI5LuO5LqL6KGM5pS/44CB566h55CG562J5bel5L2c44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5pS/5bqc5py65YWz44CB5Yab6K2m44CB5Y+45rOV44CB6KGM5pS/566h55CG562J6ZyA6KaB5p2D5aiB5ZKM6KeE6IyD55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5aW977yM5L2G5a655piT5pyJ6IKd6IOG5pa56Z2i55qE6Zeu6aKY77yM5bqU5rOo5oSP6LCD6IqC5oOF57uq44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5a625bqt5YWz57O75ZKM6LCQ77yM5bCK6YeN6ZW/6L6I77yM5L2G5Y+v6IO95a+55a2Q5aWz6KaB5rGC5Lil5qC844CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q56iz5a6a77yM6YCa6L+H5q2j5b2T6YCU5b6E6I635Y+W6LSi5a+M77yM6YCC5ZCI56iz5a6a5pS25YWl55qE5bel5L2c44CCJyxcbiAgICAgICAgdHlwZTogJ2dvb2QnLFxuICAgICAgICBzb3VyY2U6ICfjgIrmuIrmtbflrZDlubPjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+S4g+adgOagvCc6IHtcbiAgICAgICAgbmFtZTogJ+S4g+adgOagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5LiD5p2A5qC85piv5oyH5YWr5a2X5Lit5LiD5p2A5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75pe655ub77yM5Y+W5LiD5p2A5Li655So56We55qE5qC85bGA44CC5LiD5p2A5Luj6KGo5p2D5Yqb44CB56ue5LqJ44CB5Yaz5pat44CB5YuH5rCU562J44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5LiD5p2A5qC855qE5Lq66YCa5bi45oCn5qC85Yia5by677yM5pyJ5Yaz5pat5Yqb77yM5pWi5LqO56ue5LqJ77yM5L2G5Y+v6IO96L+H5LqO5by65Yq/77yM5LiN5ZaE5rKf6YCa44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5Yab6K2m44CB56ue5oqA44CB5L2T6IKy44CB6ZSA5ZSu44CB5Yib5Lia562J6ZyA6KaB56ue5LqJ5ZKM5Yaz5pat55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5aW977yM5L2G5a655piT5pyJ6IKd6IOG5pa56Z2i55qE6Zeu6aKY77yM5bqU5rOo5oSP6LCD6IqC5oOF57uq44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5Lq66ZmF5YWz57O76L6D5Li65aSN5p2C77yM5a655piT5LiO5Lq65Y+R55Sf5Yay56qB77yM5L2G5Lmf5pyJ5b+g5a6e55qE6L+96ZqP6ICF44CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q5rOi5Yqo6L6D5aSn77yM5Y+v6IO96YCa6L+H56ue5LqJ6I635Y+W6LSi5a+M77yM5L2G5Lmf5Y+v6IO95Zug5Yay5Yqo6ICM5aSx6LSi44CCJyxcbiAgICAgICAgdHlwZTogJ21peGVkJyxcbiAgICAgICAgc291cmNlOiAn44CK5riK5rW35a2Q5bmz44CL44CB44CK5LiJ5ZG96YCa5Lya44CLJ1xuICAgICAgfSxcbiAgICAgICfmraPotKLmoLwnOiB7XG4gICAgICAgIG5hbWU6ICfmraPotKLmoLwnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+ato+i0ouagvOaYr+aMh+WFq+Wtl+S4reato+i0ouaYn+W9k+S7pOaIluacieWKm++8jOS4lOaXpeS4u+aXuuebm++8jOWPluato+i0ouS4uueUqOelnueahOagvOWxgOOAguato+i0ouS7o+ihqOi0ouWvjOOAgeeJqei0qOOAgeS6q+WPl+etieOAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+ato+i0ouagvOeahOS6uumAmuW4uOmHjeinhueJqei0qOS6q+WPl++8jOWWhOS6jueQhui0ou+8jOWBmuS6i+eos+mHje+8jOmAguWQiOS7juS6i+WVhuS4muOAgemHkeiejeetieW3peS9nOOAgicsXG4gICAgICAgIGNhcmVlcjogJ+mAguWQiOS7juS6i+WVhuS4muOAgemHkeiejeOAgeS8muiuoeOAgeaIv+WcsOS6p+etieS4jui0ouWvjOebuOWFs+eahOW3peS9nOOAgicsXG4gICAgICAgIGhlYWx0aDogJ+S9k+i0qOi+g+Wlve+8jOS9huWuueaYk+aciea2iOWMluezu+e7n+mXrumimO+8jOW6lOazqOaEj+mlrumjn+inhOW+i+OAgicsXG4gICAgICAgIHJlbGF0aW9uc2hpcDogJ+WutuW6reWFs+ezu+WSjOiwkO+8jOWWhOS6jueFp+mhvuWutuS6uu+8jOS9huWPr+iDvei/h+S6jumHjeinhueJqei0qOOAgicsXG4gICAgICAgIHdlYWx0aDogJ+i0oui/kOiJr+Wlve+8jOiDveWkn+enr+e0r+i0ouWvjO+8jOmAguWQiOe7j+WVhuaIluaKlei1hOOAgicsXG4gICAgICAgIHR5cGU6ICdnb29kJyxcbiAgICAgICAgc291cmNlOiAn44CK5riK5rW35a2Q5bmz44CL44CB44CK5LiJ5ZG96YCa5Lya44CLJ1xuICAgICAgfSxcbiAgICAgICflgY/otKLmoLwnOiB7XG4gICAgICAgIG5hbWU6ICflgY/otKLmoLwnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+WBj+i0ouagvOaYr+aMh+WFq+Wtl+S4reWBj+i0ouaYn+W9k+S7pOaIluacieWKm++8jOS4lOaXpeS4u+aXuuebm++8jOWPluWBj+i0ouS4uueUqOelnueahOagvOWxgOOAguWBj+i0ouS7o+ihqOaEj+WkluS5i+i0ouOAgeaKleacuuOAgeWGkumZqeetieOAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+WBj+i0ouagvOeahOS6uumAmuW4uOaAp+agvOa0u+azvO+8jOWWhOS6juaKiuaPoeacuuS8mu+8jOaVouS6juWGkumZqe+8jOS9huWPr+iDvee8uuS5j+iAkOW/g+WSjOiuoeWIkuaAp+OAgicsXG4gICAgICAgIGNhcmVlcjogJ+mAguWQiOS7juS6i+aKlei1hOOAgeiCoeelqOOAgeWNmuW9qeOAgeWIm+S4muetiemcgOimgeWGkumZqeeyvuelnueahOW3peS9nOOAgicsXG4gICAgICAgIGhlYWx0aDogJ+S9k+i0qOi+g+Wlve+8jOS9huWuueaYk+acieelnue7j+ezu+e7n+mXrumimO+8jOW6lOazqOaEj+iwg+iKguaDhee7quOAgicsXG4gICAgICAgIHJlbGF0aW9uc2hpcDogJ+S6uumZheWFs+ezu+W5v+azm+S9huS4jea3seWFpe+8jOWuueaYk+e7k+S6pOaci+WPi++8jOS9huS5n+WuueaYk+S4juS6uuWPkeeUn+e6oOe6t+OAgicsXG4gICAgICAgIHdlYWx0aDogJ+i0oui/kOazouWKqOi+g+Wkp++8jOWPr+iDveacieaEj+WkluS5i+i0ou+8jOS9huS5n+WPr+iDveWboOWGsuWKqOiAjOWksei0ouOAgicsXG4gICAgICAgIHR5cGU6ICdtaXhlZCcsXG4gICAgICAgIHNvdXJjZTogJ+OAiua4iua1t+WtkOW5s+OAi+OAgeOAiuS4ieWRvemAmuS8muOAiydcbiAgICAgIH0sXG4gICAgICAn6aOf56We5qC8Jzoge1xuICAgICAgICBuYW1lOiAn6aOf56We5qC8JyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfpo5/npZ7moLzmmK/mjIflhavlrZfkuK3po5/npZ7mmJ/lvZPku6TmiJbmnInlipvvvIzkuJTml6XkuLvml7rnm5vvvIzlj5bpo5/npZ7kuLrnlKjnpZ7nmoTmoLzlsYDjgILpo5/npZ7ku6PooajmiY3oibrjgIHkuqvlj5fjgIHlrZDlpbPjgIHliJvpgKDlipvnrYnjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfpo5/npZ7moLznmoTkurrpgJrluLjmgKfmoLzlvIDmnJfvvIzmnInmiY3oibrvvIzlloTkuo7kuqvlj5fnlJ/mtLvvvIzpgILlkIjku47kuovoibrmnK/jgIHppJDppa7nrYnlt6XkvZzjgIInLFxuICAgICAgICBjYXJlZXI6ICfpgILlkIjku47kuovoibrmnK/jgIHppJDppa7jgIHlqLHkuZDjgIHmlZnogrLjgIHliJvkvZznrYnpnIDopoHmiY3oibrlkozliJvpgKDlipvnmoTlt6XkvZzjgIInLFxuICAgICAgICBoZWFsdGg6ICfkvZPotKjovoPlpb3vvIzkvYblrrnmmJPmnInmtojljJbns7vnu5/pl67popjvvIzlupTms6jmhI/ppa7po5/op4TlvovjgIInLFxuICAgICAgICByZWxhdGlvbnNoaXA6ICfkurrpmYXlhbPns7voia/lpb3vvIzlloTkuo7kuqTpmYXvvIzkuI7lrZDlpbPlhbPns7vkurLlr4bjgIInLFxuICAgICAgICB3ZWFsdGg6ICfotKLov5DnqLPlrprvvIzog73lpJ/pgJrov4fmiY3oibrojrflj5botKLlr4zvvIzpgILlkIjoh6rnlLHogYzkuJrjgIInLFxuICAgICAgICB0eXBlOiAnZ29vZCcsXG4gICAgICAgIHNvdXJjZTogJ+OAiua4iua1t+WtkOW5s+OAi+OAgeOAiuS4ieWRvemAmuS8muOAiydcbiAgICAgIH0sXG4gICAgICAn5Lyk5a6Y5qC8Jzoge1xuICAgICAgICBuYW1lOiAn5Lyk5a6Y5qC8JyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfkvKTlrpjmoLzmmK/mjIflhavlrZfkuK3kvKTlrpjmmJ/lvZPku6TmiJbmnInlipvvvIzkuJTml6XkuLvml7rnm5vvvIzlj5bkvKTlrpjkuLrnlKjnpZ7nmoTmoLzlsYDjgILkvKTlrpjku6PooajmiY3ljY7jgIHlj6PmiY3jgIHliJvmlrDjgIHlj5vpgIbnrYnjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfkvKTlrpjmoLznmoTkurrpgJrluLjogarmmI7kvLbkv5DvvIzmnInlj6PmiY3vvIzlloTkuo7liJvmlrDvvIzkvYblj6/og73ov4fkuo7lj5vpgIbvvIzkuI3lrojop4Tnn6njgIInLFxuICAgICAgICBjYXJlZXI6ICfpgILlkIjku47kuovmvJTorrLjgIHplIDllK7jgIHlqpLkvZPjgIHoibrmnK/jgIHliJvmlrDnrYnpnIDopoHlj6PmiY3lkozliJvpgKDlipvnmoTlt6XkvZzjgIInLFxuICAgICAgICBoZWFsdGg6ICfkvZPotKjovoPlpb3vvIzkvYblrrnmmJPmnInnpZ7nu4/ns7vnu5/pl67popjvvIzlupTms6jmhI/osIPoioLmg4Xnu6rjgIInLFxuICAgICAgICByZWxhdGlvbnNoaXA6ICfkurrpmYXlhbPns7vlpI3mnYLvvIzlrrnmmJPkuI7mnYPlqIHlj5HnlJ/lhrLnqoHvvIzkvYbkuZ/mnInlv6Dlrp7nmoTov73pmo/ogIXjgIInLFxuICAgICAgICB3ZWFsdGg6ICfotKLov5Dms6LliqjovoPlpKfvvIzlj6/og73pgJrov4fmiY3ljY7ojrflj5botKLlr4zvvIzkvYbkuZ/lj6/og73lm6Dlj5vpgIbogIzlpLHotKLjgIInLFxuICAgICAgICB0eXBlOiAnbWl4ZWQnLFxuICAgICAgICBzb3VyY2U6ICfjgIrmuIrmtbflrZDlubPjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+avlOiCqeagvCc6IHtcbiAgICAgICAgbmFtZTogJ+avlOiCqeagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5q+U6IKp5qC85piv5oyH5YWr5a2X5Lit5q+U6IKp5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75YGP5byx77yM5Y+W5q+U6IKp5Li655So56We55qE5qC85bGA44CC5q+U6IKp5Luj6KGo5YWE5byf44CB5ZCM5LqL44CB56ue5LqJ44CB5ZCI5L2c562J44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5q+U6IKp5qC855qE5Lq66YCa5bi45oCn5qC85Z2a5by677yM5pyJ6L+b5Y+W5b+D77yM5ZaE5LqO5ZCI5L2c77yM5L2G5Y+v6IO96L+H5LqO5by65Yq/77yM5LiN5ZaE5rKf6YCa44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5Zui6Zif5ZCI5L2c44CB566h55CG44CB6ZSA5ZSu44CB5Yib5Lia562J6ZyA6KaB5ZCI5L2c57K+56We55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5aW977yM5L2G5a655piT5pyJ6IKd6IOG5pa56Z2i55qE6Zeu6aKY77yM5bqU5rOo5oSP6LCD6IqC5oOF57uq44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5LiO5YWE5byf5aeQ5aa55YWz57O75a+G5YiH77yM5ZaE5LqO5Zui6Zif5ZCI5L2c77yM5L2G5Y+v6IO95LiO6YWN5YG25YWz57O757Sn5byg44CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q56iz5a6a77yM6IO95aSf6YCa6L+H5Yqq5Yqb6I635Y+W6LSi5a+M77yM6YCC5ZCI5Yib5Lia5oiW5ZCI5LyZ57uP6JCl44CCJyxcbiAgICAgICAgdHlwZTogJ25ldXRyYWwnLFxuICAgICAgICBzb3VyY2U6ICfjgIrmuIrmtbflrZDlubPjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+WKq+i0ouagvCc6IHtcbiAgICAgICAgbmFtZTogJ+WKq+i0ouagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5Yqr6LSi5qC85piv5oyH5YWr5a2X5Lit5Yqr6LSi5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75YGP5byx77yM5Y+W5Yqr6LSi5Li655So56We55qE5qC85bGA44CC5Yqr6LSi5Luj6KGo5Yay5Yqo44CB6Zy45rCU44CB54us56uL44CB5Y+Y5Yqo562J44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5Yqr6LSi5qC855qE5Lq66YCa5bi45oCn5qC85Yia5by677yM5pyJ54us56uL57K+56We77yM5pWi5LqO5YaS6Zmp77yM5L2G5Y+v6IO96L+H5LqO5Yay5Yqo77yM5LiN5ZaE55CG6LSi44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5YaS6Zmp44CB5Yib5Lia44CB6ZSA5ZSu44CB5L2T6IKy562J6ZyA6KaB5Yay5Yqy5ZKM54us56uL57K+56We55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5aW977yM5L2G5a655piT5pyJ6IKd6IOG5pa56Z2i55qE6Zeu6aKY77yM5bqU5rOo5oSP6LCD6IqC5oOF57uq44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5Lq66ZmF5YWz57O76L6D5Li65aSN5p2C77yM5a655piT5LiO5Lq65Y+R55Sf5Yay56qB77yM5L2G5Lmf5pyJ5b+g5a6e55qE6L+96ZqP6ICF44CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q5rOi5Yqo6L6D5aSn77yM5Y+v6IO95pyJ5oSP5aSW5LmL6LSi77yM5L2G5Lmf5a655piT56C06LSi44CCJyxcbiAgICAgICAgdHlwZTogJ21peGVkJyxcbiAgICAgICAgc291cmNlOiAn44CK5riK5rW35a2Q5bmz44CL44CB44CK5LiJ5ZG96YCa5Lya44CLJ1xuICAgICAgfSxcbiAgICAgICfkuJPml7rmoLwnOiB7XG4gICAgICAgIG5hbWU6ICfkuJPml7rmoLwnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+S4k+aXuuagvOaYr+aMh+aXpeS4u+aegeaXuu+8jOS4lOacieWkmuS4quavlOWKq+W4ruaJtueahOeJueauiuagvOWxgOOAguatpOagvOWxgOaXpeS4u+i/h+S6juW8uuWKv++8jOmcgOimgeazhOengOS5i+eJqeadpeW5s+ihoeOAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+S4k+aXuuagvOeahOS6uumAmuW4uOaAp+agvOWImuW8uu+8jOaciemihuWvvOiDveWKm++8jOS9huWPr+iDvei/h+S6juW8uuWKv++8jOS4jeWWhOayn+mAmuOAgicsXG4gICAgICAgIGNhcmVlcjogJ+mAguWQiOS7juS6i+mihuWvvOOAgeeuoeeQhuOAgeWIm+S4muetiemcgOimgeW8uuWKv+WSjOWGs+aWreeahOW3peS9nOOAgicsXG4gICAgICAgIGhlYWx0aDogJ+S9k+i0qOi+g+Wlve+8jOS9huWuueaYk+acieW/g+iEkeihgOeuoemXrumimO+8jOW6lOazqOaEj+iwg+iKguaDhee7quOAgicsXG4gICAgICAgIHJlbGF0aW9uc2hpcDogJ+S6uumZheWFs+ezu+i+g+S4uuWkjeadgu+8jOWuueaYk+S4juS6uuWPkeeUn+WGsueqge+8jOS9huS5n+acieW/oOWunueahOi/vemaj+iAheOAgicsXG4gICAgICAgIHdlYWx0aDogJ+i0oui/kOazouWKqOi+g+Wkp++8jOWPr+iDvemAmui/h+mihuWvvOiDveWKm+iOt+WPlui0ouWvjO+8jOS9huS5n+WPr+iDveWboOW8uuWKv+iAjOWksei0ouOAgicsXG4gICAgICAgIHR5cGU6ICdtaXhlZCcsXG4gICAgICAgIHNvdXJjZTogJ+OAiua4iua1t+WtkOW5s+OAi+OAgeOAiuS4ieWRvemAmuS8muOAiydcbiAgICAgIH0sXG4gICAgICAn5LuO5byx5qC8Jzoge1xuICAgICAgICBuYW1lOiAn5LuO5byx5qC8JyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfku47lvLHmoLzmmK/mjIfml6XkuLvmnoHlvLHvvIzkuJTmnInlpJrkuKrlrpjmnYDlhYvliLbnmoTnibnmrormoLzlsYDjgILmraTmoLzlsYDml6XkuLvov4fkuo7lvLHlir/vvIzpnIDopoHpobrku47lrpjmnYDkuYvmsJTjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfku47lvLHmoLznmoTkurrpgJrluLjmgKfmoLzmuKnlkozvvIzlloTkuo7pobrlupTnjq/looPvvIzkvYblj6/og73nvLrkuY/kuLvop4HvvIzlrrnmmJPlj5fkurrlvbHlk43jgIInLFxuICAgICAgICBjYXJlZXI6ICfpgILlkIjku47kuovovoXliqnjgIHmnI3liqHjgIHooYzmlL/nrYnpnIDopoHmnI3ku47lkozphY3lkIjnmoTlt6XkvZzjgIInLFxuICAgICAgICBoZWFsdGg6ICfkvZPotKjovoPlvLHvvIzlrrnmmJPmnInogrrpg6jjgIHlkbzlkLjns7vnu5/nlr7nl4XvvIzlupTms6jmhI/kv53lhbvjgIInLFxuICAgICAgICByZWxhdGlvbnNoaXA6ICfkurrpmYXlhbPns7vovoPkuLrlkozosJDvvIzlloTkuo7kuI7kurrnm7jlpITvvIzkvYblj6/og73nvLrkuY/kuLvop4HjgIInLFxuICAgICAgICB3ZWFsdGg6ICfotKLov5DkuIDoiKzvvIzpgILlkIjnqLPlrprmlLblhaXnmoTlt6XkvZzvvIzkuI3pgILlkIjlhpLpmanmipXotYTjgIInLFxuICAgICAgICB0eXBlOiAnbmV1dHJhbCcsXG4gICAgICAgIHNvdXJjZTogJ+OAiua4iua1t+WtkOW5s+OAi+OAgeOAiuS4ieWRvemAmuS8muOAiydcbiAgICAgIH0sXG4gICAgICAn5p2C5rCU5qC8Jzoge1xuICAgICAgICBuYW1lOiAn5p2C5rCU5qC8JyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfmnYLmsJTmoLzmmK/mjIflhavlrZfkuK3ml6DmmI7mmL7moLzlsYDnibnlvoHvvIzlkITnp43kupTooYzmnYLogIzkuI3nuq/nmoTmoLzlsYDjgILmraTmoLzlsYDpnIDopoHmoLnmja7lhbfkvZPmg4XlhrXpgInmi6nnlKjnpZ7jgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfmnYLmsJTmoLznmoTkurrpgJrluLjmgKfmoLzlpJrlj5jvvIzpgILlupTog73lipvlvLrvvIzkvYblj6/og73nvLrkuY/kuJPms6jlkozmlrnlkJHjgIInLFxuICAgICAgICBjYXJlZXI6ICfpgILlkIjku47kuovlpJrmoLfljJbjgIHngbXmtLvmgKflvLrnmoTlt6XkvZzvvIzmiJbogIXpnIDopoHnu7zlkIjog73lipvnmoTlt6XkvZzjgIInLFxuICAgICAgICBoZWFsdGg6ICfkvZPotKjkuIDoiKzvvIzlupTmoLnmja7lhbfkvZPmg4XlhrXms6jmhI/kv53lhbvjgIInLFxuICAgICAgICByZWxhdGlvbnNoaXA6ICfkurrpmYXlhbPns7vovoPkuLrlpI3mnYLvvIzlj6/og73lnKjkuI3lkIzlnLrlkIjooajnjrDlh7rkuI3lkIznmoTmgKfmoLzjgIInLFxuICAgICAgICB3ZWFsdGg6ICfotKLov5Dms6LliqjovoPlpKfvvIzpnIDopoHmoLnmja7lhbfkvZPmg4XlhrXosIPmlbTnkIbotKLnrZbnlaXjgIInLFxuICAgICAgICB0eXBlOiAnbmV1dHJhbCcsXG4gICAgICAgIHNvdXJjZTogJ+OAiua4iua1t+WtkOW5s+OAi+OAgeOAiuS4ieWRvemAmuS8muOAiydcbiAgICAgIH0sXG4gICAgICAn5LuO5pe65qC8Jzoge1xuICAgICAgICBuYW1lOiAn5LuO5pe65qC8JyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfku47ml7rmoLzmmK/mjIfml6XkuLvmnoHml7rvvIzkuJTmnInlpJrkuKrmr5TliqvluK7mibbvvIzlj5bmr5TliqvkuLrnlKjnpZ7nmoTnibnmrormoLzlsYDjgILmraTmoLzlsYDkuI3ms4Tnp4Dml6XkuLvkuYvmsJTvvIzogIzmmK/pobrku47ml6XkuLvkuYvml7rjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfku47ml7rmoLznmoTkurrpgJrluLjmgKfmoLzliJrlvLrvvIzmnInpooblr7zog73lipvvvIzoh6rkv6Hlv4PlvLrvvIzlgZrkuovmnpzmlq3vvIzkvYblj6/og73ov4fkuo7lvLrlir/vvIzkuI3lloTlkKzlj5bku5bkurrmhI/op4HjgIInLFxuICAgICAgICBjYXJlZXI6ICfpgILlkIjku47kuovpooblr7zjgIHnrqHnkIbjgIHlhpvorabjgIHkvZPogrLjgIHnq57mioDnrYnpnIDopoHlvLrlir/lkozlhrPmlq3nmoTlt6XkvZzjgIInLFxuICAgICAgICBoZWFsdGg6ICfkvZPotKjovoPlpb3vvIzkvYblrrnmmJPmnInlv4PohJHooYDnrqHpl67popjvvIzlupTms6jmhI/osIPoioLmg4Xnu6rvvIzpgb/lhY3ov4fluqblirPntK/jgIInLFxuICAgICAgICByZWxhdGlvbnNoaXA6ICfkurrpmYXlhbPns7vovoPkuLrlpI3mnYLvvIzlrrnmmJPkuI7kurrlj5HnlJ/lhrLnqoHvvIzkvYbkuZ/mnInlv6Dlrp7nmoTov73pmo/ogIXjgILlnKjlrrbluq3kuK3lvoDlvoDmmK/kuLvlr7zogIXjgIInLFxuICAgICAgICB3ZWFsdGg6ICfotKLov5Dms6LliqjovoPlpKfvvIzlj6/og73pgJrov4fpooblr7zog73lipvojrflj5botKLlr4zvvIzkvYbkuZ/lj6/og73lm6DlvLrlir/ogIzlpLHotKLjgIInLFxuICAgICAgICB0eXBlOiAnbWl4ZWQnLFxuICAgICAgICBzb3VyY2U6ICfjgIrlrZDlubPnnJ/or6DjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+WNsOe7tuagvCc6IHtcbiAgICAgICAgbmFtZTogJ+WNsOe7tuagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5Y2w57u25qC85piv5oyH5YWr5a2X5Lit5Y2w5pif54m55Yir5pe655ub77yM5LiU5pel5Li75YGP5byx77yM5Y+W5Y2w5pif5Li655So56We55qE5qC85bGA44CC5Y2w57u25Luj6KGo5a2m6Zeu44CB5paH5Yet44CB6LS15Lq644CB5pm65oWn562J44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5Y2w57u25qC855qE5Lq66YCa5bi46IGq5piO5aW95a2m77yM5oCn5qC85rip5ZKM77yM5pyJ5paH5YyW5L+u5YW777yM5b6X6ZW/6L6I5o+Q5pC677yM6YCC5ZCI5LuO5LqL5paH5YyW44CB5pWZ6IKy44CB6KGM5pS/562J5bel5L2c44CCJyxcbiAgICAgICAgY2FyZWVyOiAn54m55Yir6YCC5ZCI5LuO5LqL5pWZ6IKy44CB5paH5YyW44CB6KGM5pS/44CB5YWs5Yqh5ZGY44CB5Yy755Sf44CB5b6L5biI562J6ZyA6KaB5LiT5Lia55+l6K+G5ZKM5paH5Yet55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5byx77yM5a655piT5pyJ6IK66YOo44CB5ZG85ZC457O757uf55a+55eF77yM5bqU5rOo5oSP5L+d5YW744CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5LiO6ZW/6L6I5YWz57O754m55Yir6Imv5aW977yM5b6X5Yiw6ZW/6L6I5o+Q5pC677yM5L2G5Y+v6IO95a+55a2Q5aWz6L+H5LqO5Lil5qC844CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q56iz5a6a77yM5L2G5LiN5Lya5aSn5a+M5aSn6LS177yM6YCC5ZCI56iz5a6a5pS25YWl55qE5bel5L2c44CCJyxcbiAgICAgICAgdHlwZTogJ2dvb2QnLFxuICAgICAgICBzb3VyY2U6ICfjgIrmuIrmtbflrZDlubPjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+S8pOWumOS9qeWNsOagvCc6IHtcbiAgICAgICAgbmFtZTogJ+S8pOWumOS9qeWNsOagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5Lyk5a6Y5L2p5Y2w5qC85piv5oyH5YWr5a2X5Lit5ZCM5pe25pyJ5Lyk5a6Y5ZKM5Y2w5pif77yM5LiU5Lik6ICF5Yqb6YeP5Z2H6KGh77yM55u45LqS5Yi257qm55qE5qC85bGA44CC5Lyk5a6Y5Luj6KGo5omN5Y2O44CB5Yib5paw77yM5Y2w5pif5Luj6KGo5a2m6Zeu44CB5paH5Yet44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5Lyk5a6Y5L2p5Y2w5qC855qE5Lq66YCa5bi45pei5pyJ5Yib5paw6IO95Yqb77yM5Y+I5pyJ5a2m5pyv5L+u5YW777yM6IGq5piO54G156eA77yM5pyJ5paH6Im65aSp6LWL77yM5oCd57u05rS76LeD77yM5L2G5oCn5qC85Y+v6IO96L6D5Li65aSN5p2C44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5pWZ6IKy44CB5paH5YyW44CB6Im65pyv44CB6K6+6K6h44CB56CU56m2562J6ZyA6KaB5Yib6YCg5Yqb5ZKM5a2m5pyv6IOM5pmv55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo5LiA6Iis77yM5a655piT5pyJ56We57uP57O757uf44CB57K+56We5pa56Z2i55qE6Zeu6aKY77yM5bqU5rOo5oSP6LCD6IqC5oOF57uq44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5Lq66ZmF5YWz57O76L6D5Li65aSN5p2C77yM5pei5pyJ5a2m5pyv5ZyI55qE5Lq66ISJ77yM5Y+I5pyJ6Im65pyv5ZyI55qE5pyL5Y+L77yM5L2G5Y+v6IO95YaF5b+D55+b55u+44CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q56iz5a6a77yM6YCa6L+H5omN5Y2O5ZKM5a2m6K+G6I635Y+W6LSi5a+M77yM6YCC5ZCI55+l6K+G5Z6L5bel5L2c44CCJyxcbiAgICAgICAgdHlwZTogJ2dvb2QnLFxuICAgICAgICBzb3VyY2U6ICfjgIrlrZDlubPnnJ/or6DjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+i0ouWumOWPjOe+juagvCc6IHtcbiAgICAgICAgbmFtZTogJ+i0ouWumOWPjOe+juagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn6LSi5a6Y5Y+M576O5qC85piv5oyH5YWr5a2X5Lit6LSi5pif5ZKM5a6Y5pif6YO95pe655ub5pyJ5Yqb77yM5LiU5pel5Li76YCC5Lit77yM6IO95aSf5om/5Y+X6LSi5a6Y5LmL5Yqb55qE5qC85bGA44CC6LSi5pif5Luj6KGo6LSi5a+M77yM5a6Y5pif5Luj6KGo5p2D5Yqb44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn6LSi5a6Y5Y+M576O5qC855qE5Lq66YCa5bi45LqL5Lia5pyJ5oiQ77yM6LSi6L+Q5Lqo6YCa77yM5pei5pyJ5p2D5Yqb5Y+I5pyJ6LSi5a+M77yM56S+5Lya5Zyw5L2N6L6D6auY44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5pS/5ZWG5Lik55WM55qE5bel5L2c77yM5aaC5LyB5Lia566h55CG44CB6YeR6J6N5oqV6LWE44CB5pS/5bqc5py65YWz562J44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo6L6D5aW977yM5L2G5a655piT5Zug5bel5L2c5Y6L5Yqb5aSn6ICM5Ye6546w5YGl5bq36Zeu6aKY77yM5bqU5rOo5oSP5Yqz6YC457uT5ZCI44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn56S+5Lya5YWz57O75bm/5rOb77yM5Lq66ISJ5Liw5a+M77yM5L2G5Y+v6IO95Zug5b+Z5LqO5LqL5Lia6ICM5b+955Wl5a625bqt44CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q5p6B5L2z77yM6IO95aSf6YCa6L+H5q2j5b2T6YCU5b6E6I635Y+W5aSn6YeP6LSi5a+M77yM6YCC5ZCI5Yib5Lia5oiW6auY566h6IGM5L2N44CCJyxcbiAgICAgICAgdHlwZTogJ2dvb2QnLFxuICAgICAgICBzb3VyY2U6ICfjgIrmuIrmtbflrZDlubPjgIvjgIHjgIrkuInlkb3pgJrkvJrjgIsnXG4gICAgICB9LFxuICAgICAgJ+S8pOWumOingeWumOagvCc6IHtcbiAgICAgICAgbmFtZTogJ+S8pOWumOingeWumOagvCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5Lyk5a6Y6KeB5a6Y5qC85piv5oyH5YWr5a2X5Lit5ZCM5pe25pyJ5Lyk5a6Y5ZKM5a6Y5pif77yM5LiU5Lyk5a6Y5Yqb6YeP6L6D5by677yM5a6Y5pif5qyh5LmL55qE5qC85bGA44CC5Lyk5a6Y5Luj6KGo5omN5Y2O44CB5Yib5paw77yM5a6Y5pif5Luj6KGo5p2D5Yqb44CB6KeE55+p44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5Lyk5a6Y6KeB5a6Y5qC855qE5Lq66YCa5bi45omN5Y2O5qiq5rqi77yM5L2G5Lmf6IO95a6I6KeE55+p77yM5pei5pyJ5Yib5paw6IO95Yqb77yM5Y+I5pyJ57uE57uH57qq5b6L5oCn77yM6YCC5ZCI5Zyo5L2T5Yi25YaF5Y+R5oyl5Yib6YCg5Yqb44CCJyxcbiAgICAgICAgY2FyZWVyOiAn6YCC5ZCI5LuO5LqL5pWZ6IKy566h55CG44CB5paH5YyW6KGM5pS/44CB5Yib5paw56CU5Y+R562J6ZyA6KaB5Yib6YCg5Yqb5L2G5Y+I5pyJ57uE57uH5p625p6E55qE5bel5L2c44CCJyxcbiAgICAgICAgaGVhbHRoOiAn5L2T6LSo5LiA6Iis77yM5a655piT5Zug5bel5L2c5Y6L5Yqb5aSn6ICM5Ye6546w5YGl5bq36Zeu6aKY77yM5bqU5rOo5oSP6LCD6IqC5oOF57uq44CCJyxcbiAgICAgICAgcmVsYXRpb25zaGlwOiAn5Lq66ZmF5YWz57O76L6D5Li65aSN5p2C77yM5Y+v6IO95Zyo5LiN5ZCM5Zy65ZCI6KGo546w5Ye65LiN5ZCM55qE5oCn5qC877yM5pei6IO95Yib5paw5Y+I6IO95a6I6KeE55+p44CCJyxcbiAgICAgICAgd2VhbHRoOiAn6LSi6L+Q56iz5a6a77yM6YCa6L+H5omN5Y2O5ZKM6IGM5L2N6I635Y+W6LSi5a+M77yM6YCC5ZCI5L2T5Yi25YaF55qE5Yib5paw5bel5L2c44CCJyxcbiAgICAgICAgdHlwZTogJ21peGVkJyxcbiAgICAgICAgc291cmNlOiAn44CK5a2Q5bmz55yf6K+g44CL44CB44CK5LiJ5ZG96YCa5Lya44CLJ1xuICAgICAgfSxcbiAgICAgICfml6XlhYPlu7rnpoTmoLwnOiB7XG4gICAgICAgIG5hbWU6ICfml6XlhYPlu7rnpoTmoLwnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+aXpeWFg+W7uuemhOagvOaYr+aMh+aXpeS4u+WkqeW5suS4juaJgOWkhOaciOS7pOWcsOaUr+aehOaIkOW7uuemhOWFs+ezu+eahOagvOWxgOOAguW7uuemhOS7o+ihqOadg+WKm+OAgeWcsOS9jeOAgeWQjeiqieOAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+aXpeWFg+W7uuemhOagvOeahOS6uumAmuW4uOWcsOS9jeaYvui1q++8jOWQjeWjsOi/nOaSre+8jOaciei+g+mrmOeahOekvuS8muWcsOS9jeWSjOWjsOacm+OAgicsXG4gICAgICAgIGNhcmVlcjogJ+mAguWQiOS7juS6i+aUv+W6nOacuuWFs+OAgeWGm+itpuOAgeWPuOazleOAgeihjOaUv+euoeeQhuetiemcgOimgeadg+WogeWSjOWjsOacm+eahOW3peS9nOOAgicsXG4gICAgICAgIGhlYWx0aDogJ+S9k+i0qOi+g+Wlve+8jOS9huWuueaYk+WboOW3peS9nOWOi+WKm+Wkp+iAjOWHuueOsOWBpeW6t+mXrumimO+8jOW6lOazqOaEj+WKs+mAuOe7k+WQiOOAgicsXG4gICAgICAgIHJlbGF0aW9uc2hpcDogJ+ekvuS8muWFs+ezu+iJr+Wlve+8jOWPl+S6uuWwiuaVrO+8jOS9huWPr+iDveWboOWcsOS9jemrmOiAjOS4juaZrumAmuS6uuaciei3neemu+aEn+OAgicsXG4gICAgICAgIHdlYWx0aDogJ+i0oui/kOeos+Wumu+8jOmAmui/h+iBjOS9jeWSjOWjsOacm+iOt+WPlui0ouWvjO+8jOmAguWQiOS9k+WItuWGheeahOmrmOe6p+iBjOS9jeOAgicsXG4gICAgICAgIHR5cGU6ICdnb29kJyxcbiAgICAgICAgc291cmNlOiAn44CK5riK5rW35a2Q5bmz44CL44CB44CK5LiJ5ZG96YCa5Lya44CLJ1xuICAgICAgfSxcbiAgICAgICfml6XlhYPlu7rlhYPmoLwnOiB7XG4gICAgICAgIG5hbWU6ICfml6XlhYPlu7rlhYPmoLwnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+aXpeWFg+W7uuWFg+agvOaYr+aMh+aXpeS4u+WkqeW5suS4juaJgOWkhOaciOS7pOWcsOaUr+aehOaIkOW7uuWFg+WFs+ezu+eahOagvOWxgOOAguW7uuWFg+S7o+ihqOagueWfuuOAgea6kOWktOOAgei1t+Wni+OAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+aXpeWFg+W7uuWFg+agvOeahOS6uumAmuW4uOagueWfuua3seWOmu+8jOWBmuS6i+i4j+Wunu+8jOaciemVv+i/nOinhOWIku+8jOmAguWQiOS7juS6i+WfuuehgOaAp+OAgemVv+acn+aAp+eahOW3peS9nOOAgicsXG4gICAgICAgIGNhcmVlcjogJ+mAguWQiOS7juS6i+aVmeiCsuOAgeenkeeglOOAgeWGnOS4muOAgeWfuuehgOiuvuaWveetiemcgOimgemVv+acn+enr+e0r+WSjOa3seWOmuagueWfuueahOW3peS9nOOAgicsXG4gICAgICAgIGhlYWx0aDogJ+S9k+i0qOi+g+Wlve+8jOeUn+WRveWKm+W8uu+8jOS9huW6lOazqOaEj+S/neaMgeinhOW+i+eahOeUn+a0u+S5oOaDr+OAgicsXG4gICAgICAgIHJlbGF0aW9uc2hpcDogJ+S6uumZheWFs+ezu+eos+Wumu+8jOmHjeinhuWutuW6reWSjOagueWfuu+8jOS4juS6suWPi+WFs+ezu+WvhuWIh+OAgicsXG4gICAgICAgIHdlYWx0aDogJ+i0oui/kOeos+Wumu+8jOmAmui/h+mVv+acn+enr+e0r+iOt+WPlui0ouWvjO+8jOmAguWQiOeos+WBpeWei+aKlei1hOOAgicsXG4gICAgICAgIHR5cGU6ICdnb29kJyxcbiAgICAgICAgc291cmNlOiAn44CK5riK5rW35a2Q5bmz44CL44CB44CK5LiJ5ZG96YCa5Lya44CLJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZXhwbGFuYXRpb25zW2dlSnVdIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5qC85bGA55qE6K+m57uG6Kej6YeKXG4gICAqIEBwYXJhbSBnZUp1IOagvOWxgOWQjeensFxuICAgKiBAcmV0dXJucyDmoLzlsYDnmoTor6bnu4bop6Pph4pcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0R2VKdUV4cGxhbmF0aW9uKGdlSnU6IHN0cmluZyk6IHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZXhwbGFuYXRpb246IHN0cmluZztcbiAgICBpbmZsdWVuY2U6IHN0cmluZztcbiAgICBjYXJlZXI6IHN0cmluZztcbiAgICBoZWFsdGg6IHN0cmluZztcbiAgICByZWxhdGlvbnNoaXA6IHN0cmluZztcbiAgICB3ZWFsdGg6IHN0cmluZztcbiAgICB0eXBlOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCc7XG4gICAgc291cmNlPzogc3RyaW5nO1xuICB9IHtcbiAgICBjb25zdCBpbmZvID0gdGhpcy5nZXRHZUp1SW5mbyhnZUp1KTtcblxuICAgIGlmIChpbmZvKSB7XG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZ2VKdSxcbiAgICAgIGV4cGxhbmF0aW9uOiAn5pqC5peg6Kej6YeKJyxcbiAgICAgIGluZmx1ZW5jZTogJ+aaguaXoOW9seWTjScsXG4gICAgICBjYXJlZXI6ICfmmoLml6DogYzkuJrlu7rorq4nLFxuICAgICAgaGVhbHRoOiAn5pqC5peg5YGl5bq35bu66K6uJyxcbiAgICAgIHJlbGF0aW9uc2hpcDogJ+aaguaXoOS6uumZheWFs+ezu+W7uuiuricsXG4gICAgICB3ZWFsdGg6ICfmmoLml6DotKLov5Dlu7rorq4nLFxuICAgICAgdHlwZTogJ25ldXRyYWwnXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliIbmnpDmoLzlsYDnmoTlkInlh7ZcbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqIEBwYXJhbSByaVpodVN0cmVuZ3RoIOaXpeS4u+aXuuihsFxuICAgKiBAcmV0dXJucyDmoLzlsYDlkInlh7bliIbmnpBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYW5hbHl6ZUdlSnUoZ2VKdTogc3RyaW5nLCByaVpodVN0cmVuZ3RoOiBzdHJpbmcpOiB7XG4gICAgYW5hbHlzaXM6IHN0cmluZztcbiAgICBzdWdnZXN0aW9uOiBzdHJpbmc7XG4gICAgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJztcbiAgfSB7XG4gICAgY29uc3QgZ2VKdUluZm8gPSB0aGlzLmdldEdlSnVJbmZvKGdlSnUpO1xuXG4gICAgaWYgKCFnZUp1SW5mbykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYW5hbHlzaXM6ICfml6Dms5XliIbmnpDmraTmoLzlsYDvvIzor7flkqjor6LkuJPkuJrlkb3nkIbluIjjgIInLFxuICAgICAgICBzdWdnZXN0aW9uOiAn5bu66K6u57uT5ZCI5YW35L2T5YWr5a2X6L+b6KGM6K+m57uG5YiG5p6Q44CCJyxcbiAgICAgICAgbGV2ZWw6ICduZXV0cmFsJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyDmoLnmja7moLzlsYDlkozml6XkuLvml7roobDov5vooYzliIbmnpBcbiAgICBsZXQgYW5hbHlzaXMgPSAnJztcbiAgICBsZXQgc3VnZ2VzdGlvbiA9ICcnO1xuICAgIGxldCBsZXZlbDogJ2dvb2QnIHwgJ2JhZCcgfCAnbmV1dHJhbCcgfCAnbWl4ZWQnID0gZ2VKdUluZm8udHlwZTtcblxuICAgIC8vIOagueaNruagvOWxgOexu+Wei+WSjOaXpeS4u+aXuuihsOi/m+ihjOWFt+S9k+WIhuaekFxuICAgIHN3aXRjaCAoZ2VKdSkge1xuICAgICAgY2FzZSAn5q2j5Y2w5qC8JzpcbiAgICAgIGNhc2UgJ+WBj+WNsOagvCc6XG4gICAgICBjYXNlICfljbDnu7bmoLwnOlxuICAgICAgICBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+W8sScgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+aegeW8sScgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+WBj+W8sScpIHtcbiAgICAgICAgICBhbmFseXNpcyA9IGAke2dlSnV96YWN5ZCI5pel5Li75YGP5byx77yM5Y2w5pif55Sf5Yqp5pel5Li777yM5qC85bGA6Imv5aW944CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiuruWPkeWxleaVmeiCsuOAgeaWh+WMluOAgeihjOaUv+etieWNsOaYn+acieWIqeeahOS6i+S4muOAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnZ29vZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYW5hbHlzaXMgPSBgJHtnZUp1feS9huaXpeS4u+W5tuS4jeW8se+8jOWNsOaYn+WPr+iDvei/h+Wkmu+8jOWvvOiHtOaXpeS4u+abtOaXuu+8jOS4jeWIqeS6juW5s+ihoeOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICflu7rorq7pgILlvZPms4Tnp4Dml6XkuLvkuYvmsJTvvIzlj5HlsZXotKLlrpjnrYnkuovkuJrjgIInO1xuICAgICAgICAgIGxldmVsID0gJ25ldXRyYWwnO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfmraPlrpjmoLwnOlxuICAgICAgY2FzZSAn5LiD5p2A5qC8JzpcbiAgICAgICAgaWYgKHJpWmh1U3RyZW5ndGggPT09ICfml7onIHx8IHJpWmh1U3RyZW5ndGggPT09ICfmnoHml7onIHx8IHJpWmh1U3RyZW5ndGggPT09ICflgY/ml7onKSB7XG4gICAgICAgICAgYW5hbHlzaXMgPSBgJHtnZUp1femFjeWQiOaXpeS4u+WBj+aXuu+8jOWumOadgOazhOengOaXpeS4u++8jOagvOWxgOiJr+WlveOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICflu7rorq7lj5HlsZXooYzmlL/jgIHnrqHnkIbjgIHlhpvorabnrYnlrpjmnYDmnInliKnnmoTkuovkuJrjgIInO1xuICAgICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3kvYbml6XkuLvlubbkuI3ml7rvvIzlrpjmnYDlj6/og73ov4flpJrvvIzlr7zoh7Tml6XkuLvmm7TlvLHvvIzkuI3liKnkuo7lubPooaHjgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5bu66K6u6YCC5b2T5om25Yqp5pel5Li75LmL5rCU77yM5Y+R5bGV5Y2w5q+U562J5LqL5Lia44CCJztcbiAgICAgICAgICBsZXZlbCA9ICduZXV0cmFsJztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAn5q2j6LSi5qC8JzpcbiAgICAgIGNhc2UgJ+WBj+i0ouagvCc6XG4gICAgICAgIGlmIChyaVpodVN0cmVuZ3RoID09PSAn5pe6JyB8fCByaVpodVN0cmVuZ3RoID09PSAn5p6B5pe6JyB8fCByaVpodVN0cmVuZ3RoID09PSAn5YGP5pe6Jykge1xuICAgICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3phY3lkIjml6XkuLvlgY/ml7rvvIzotKLmmJ/ogJfms4Tml6XkuLvvvIzmoLzlsYDoia/lpb3jgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5bu66K6u5Y+R5bGV5ZWG5Lia44CB6YeR6J6N44CB5oqV6LWE562J6LSi5pif5pyJ5Yip55qE5LqL5Lia44CCJztcbiAgICAgICAgICBsZXZlbCA9ICdnb29kJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmFseXNpcyA9IGAke2dlSnV95L2G5pel5Li75bm25LiN5pe677yM6LSi5pif5Y+v6IO96L+H5aSa77yM5a+86Ie05pel5Li75pu05byx77yM5LiN5Yip5LqO5bmz6KGh44CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiurumAguW9k+aJtuWKqeaXpeS4u+S5i+awlO+8jOWPkeWxleWNsOavlOetieS6i+S4muOAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnbmV1dHJhbCc7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ+mjn+elnuagvCc6XG4gICAgICBjYXNlICfkvKTlrpjmoLwnOlxuICAgICAgICBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+aXuicgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+aegeaXuicgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+WBj+aXuicpIHtcbiAgICAgICAgICBhbmFseXNpcyA9IGAke2dlSnV96YWN5ZCI5pel5Li75YGP5pe677yM6aOf5Lyk5rOE56eA5pel5Li777yM5qC85bGA6Imv5aW944CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiuruWPkeWxleiJuuacr+OAgeaVmeiCsuOAgemkkOmlruOAgeWIm+S9nOetiemjn+S8pOacieWIqeeahOS6i+S4muOAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnZ29vZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYW5hbHlzaXMgPSBgJHtnZUp1feS9huaXpeS4u+W5tuS4jeaXuu+8jOmjn+S8pOWPr+iDvei/h+Wkmu+8jOWvvOiHtOaXpeS4u+abtOW8se+8jOS4jeWIqeS6juW5s+ihoeOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICflu7rorq7pgILlvZPmibbliqnml6XkuLvkuYvmsJTvvIzlj5HlsZXljbDmr5TnrYnkuovkuJrjgIInO1xuICAgICAgICAgIGxldmVsID0gJ25ldXRyYWwnO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfmr5TogqnmoLwnOlxuICAgICAgY2FzZSAn5Yqr6LSi5qC8JzpcbiAgICAgICAgaWYgKHJpWmh1U3RyZW5ndGggPT09ICflvLEnIHx8IHJpWmh1U3RyZW5ndGggPT09ICfmnoHlvLEnIHx8IHJpWmh1U3RyZW5ndGggPT09ICflgY/lvLEnKSB7XG4gICAgICAgICAgYW5hbHlzaXMgPSBgJHtnZUp1femFjeWQiOaXpeS4u+WBj+W8se+8jOavlOWKq+W4ruaJtuaXpeS4u++8jOagvOWxgOiJr+WlveOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICflu7rorq7lj5HlsZXlm6LpmJ/lkIjkvZzjgIHnrqHnkIbjgIHplIDllK7nrYnmr5TliqvmnInliKnnmoTkuovkuJrjgIInO1xuICAgICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3kvYbml6XkuLvlubbkuI3lvLHvvIzmr5Tliqvlj6/og73ov4flpJrvvIzlr7zoh7Tml6XkuLvmm7Tml7rvvIzkuI3liKnkuo7lubPooaHjgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5bu66K6u6YCC5b2T5rOE56eA5pel5Li75LmL5rCU77yM5Y+R5bGV6LSi5a6Y562J5LqL5Lia44CCJztcbiAgICAgICAgICBsZXZlbCA9ICduZXV0cmFsJztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAn5LiT5pe65qC8JzpcbiAgICAgIGNhc2UgJ+S7juaXuuagvCc6XG4gICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3ml6XkuLvmnoHml7rvvIzkuJTmnInlpJrkuKrmr5TliqvluK7mibbvvIzmoLzlsYDnibnmrorjgILpnIDopoHms6jmhI/lpKfov5DmtYHlubTmmK/lkKbmnInotKLlrpjpo5/kvKTmnaXliLbnuqbml6XkuLvnmoTov4fml7rjgIJgO1xuICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiuruWPkeWxlemihuWvvOOAgeeuoeeQhuOAgeWIm+S4muetiemcgOimgeW8uuWKv+WSjOWGs+aWreeahOW3peS9nO+8jOS9humcgOazqOaEj+iwg+WSjOS6uumZheWFs+ezu+OAgic7XG4gICAgICAgIGxldmVsID0gJ21peGVkJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ+S7juW8seagvCc6XG4gICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3ml6XkuLvmnoHlvLHvvIzkuJTmnInlpJrkuKrlrpjmnYDlhYvliLbvvIzmoLzlsYDnibnmrorjgILpnIDopoHms6jmhI/lpKfov5DmtYHlubTmmK/lkKbmnInljbDmr5TmnaXmibbliqnml6XkuLvnmoTov4flvLHjgIJgO1xuICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiuruWPkeWxlei+heWKqeOAgeacjeWKoeOAgeihjOaUv+etiemcgOimgeacjeS7juWSjOmFjeWQiOeahOW3peS9nO+8jOmBv+WFjei/h+S6juW8uuWKv+eahOeOr+Wig+OAgic7XG4gICAgICAgIGxldmVsID0gJ21peGVkJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ+S8pOWumOS9qeWNsOagvCc6XG4gICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3kvKTlrpjlkozljbDmmJ/lkIzml7blrZjlnKjvvIzkuJTlipvph4/lnYfooaHvvIzmoLzlsYDnibnmrorjgILkvKTlrpjku6PooajmiY3ljY7liJvmlrDvvIzljbDmmJ/ku6Pooajlrabpl67mloflh63vvIzkuKTogIXnm7jkupLliLbnuqbvvIzlvaLmiJDoia/lpb3lubPooaHjgIJgO1xuICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiuruWPkeWxleaVmeiCsuOAgeaWh+WMluOAgeiJuuacr+OAgeiuvuiuoeOAgeeglOeptuetiemcgOimgeWIm+mAoOWKm+WSjOWtpuacr+iDjOaZr+eahOW3peS9nOOAgic7XG4gICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAn6LSi5a6Y5Y+M576O5qC8JzpcbiAgICAgICAgaWYgKHJpWmh1U3RyZW5ndGggPT09ICflubPooaEnIHx8IHJpWmh1U3RyZW5ndGggPT09ICflgY/ml7onKSB7XG4gICAgICAgICAgYW5hbHlzaXMgPSBgJHtnZUp1fei0ouaYn+WSjOWumOaYn+mDveaXuuebm+acieWKm++8jOS4lOaXpeS4u+mAguS4re+8jOiDveWkn+aJv+WPl+i0ouWumOS5i+WKm++8jOagvOWxgOaegeS9s+OAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICflu7rorq7lj5HlsZXmlL/llYbkuKTnlYznmoTlt6XkvZzvvIzlpoLkvIHkuJrnrqHnkIbjgIHph5Hono3mipXotYTjgIHmlL/lupzmnLrlhbPnrYnjgIInO1xuICAgICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3otKLmmJ/lkozlrpjmmJ/pg73ml7rnm5vmnInlipvvvIzkvYbml6XkuLvov4flvLHmiJbov4fml7rvvIzkuI3og73lvojlpb3lnLDlubPooaHotKLlrpjkuYvlipvvvIzpnIDopoHms6jmhI/osIPmlbTjgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5bu66K6u5qC55o2u5pel5Li75pe66KGw5oOF5Ya177yM6YCC5b2T6LCD5pW05LqL5Lia5pa55ZCR77yM6YG/5YWN6LSi5a6Y6L+H5pe65oiW5LiN5Y+K44CCJztcbiAgICAgICAgICBsZXZlbCA9ICdtaXhlZCc7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ+aXpeWFg+W7uuemhOagvCc6XG4gICAgICBjYXNlICfml6XlhYPlu7rlhYPmoLwnOlxuICAgICAgICBhbmFseXNpcyA9IGAke2dlSnV95pel5Li75LiO5pyI5Luk5Zyw5pSv5p6E5oiQ54m55q6K5YWz57O777yM5qC85bGA6Imv5aW944CC5pel5Li75b6X5Luk77yM5qC55Z+656iz5Zu677yM5pyJ5Yip5LqO5LqL5Lia5Y+R5bGV44CCYDtcbiAgICAgICAgc3VnZ2VzdGlvbiA9ICflu7rorq7lj5HlsZXkuI7ml6XkuLvkupTooYznm7jlhbPnmoTkuovkuJrvvIzlhYXliIblj5HmjKXml6XkuLvnmoTkvJjlir/jgIInO1xuICAgICAgICBsZXZlbCA9ICdnb29kJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFuYWx5c2lzID0gYCR7Z2VKdX3pnIDopoHnu5PlkIjlhbfkvZPlhavlrZfov5vooYzor6bnu4bliIbmnpDjgIJgO1xuICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiuruWSqOivouS4k+S4muWRveeQhuW4iOi/m+ihjOivpue7huWIhuaekOOAgic7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuYWx5c2lzLFxuICAgICAgc3VnZ2VzdGlvbixcbiAgICAgIGxldmVsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliIbmnpDlpKfov5Dlr7nmoLzlsYDnmoTlvbHlk41cbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqIEBwYXJhbSBkYVl1bkdhblpoaSDlpKfov5DlubLmlK9cbiAgICogQHBhcmFtIHJpWmh1V3VYaW5nIOaXpeS4u+S6lOihjFxuICAgKiBAcmV0dXJucyDlpKfov5Dlr7nmoLzlsYDnmoTlvbHlk43liIbmnpBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYW5hbHl6ZURhWXVuRWZmZWN0KGdlSnU6IHN0cmluZywgZGFZdW5HYW5aaGk6IHN0cmluZywgcmlaaHVXdVhpbmc6IHN0cmluZyk6IHtcbiAgICBlZmZlY3Q6IHN0cmluZztcbiAgICBzdWdnZXN0aW9uOiBzdHJpbmc7XG4gICAgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJztcbiAgfSB7XG4gICAgaWYgKCFnZUp1IHx8ICFkYVl1bkdhblpoaSB8fCAhcmlaaHVXdVhpbmcgfHwgZGFZdW5HYW5aaGkubGVuZ3RoIDwgMikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZWZmZWN0OiAn5peg5rOV5YiG5p6Q5aSn6L+Q5a+55qC85bGA55qE5b2x5ZON77yM5L+h5oGv5LiN6Laz44CCJyxcbiAgICAgICAgc3VnZ2VzdGlvbjogJ+ivt+aPkOS+m+WujOaVtOeahOagvOWxgOOAgeWkp+i/kOW5suaUr+WSjOaXpeS4u+S6lOihjOS/oeaBr+OAgicsXG4gICAgICAgIGxldmVsOiAnbmV1dHJhbCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8g6I635Y+W5aSn6L+Q5aSp5bmy5ZKM5Zyw5pSvXG4gICAgY29uc3QgZGFZdW5HYW4gPSBkYVl1bkdhblpoaVswXTsgLy8g5aSp5bmyXG4gICAgY29uc3QgZGFZdW5aaGkgPSBkYVl1bkdhblpoaVsxXTsgLy8g5Zyw5pSvXG5cbiAgICAvLyDojrflj5blpKfov5DlpKnlubLkupTooYxcbiAgICBjb25zdCBkYVl1bld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhkYVl1bkdhbik7XG5cbiAgICAvLyDliIbmnpDlpKfov5DkupTooYzkuI7ml6XkuLvkupTooYznmoTlhbPns7tcbiAgICBjb25zdCByZWxhdGlvbnNoaXAgPSB0aGlzLmdldFd1WGluZ1JlbGF0aW9uc2hpcChkYVl1bld1WGluZywgcmlaaHVXdVhpbmcpO1xuXG4gICAgLy8g5qC55o2u5qC85bGA57G75Z6L5ZKM5aSn6L+Q5LqU6KGM5YWz57O76L+b6KGM5YiG5p6QXG4gICAgbGV0IGVmZmVjdCA9ICcnO1xuICAgIGxldCBzdWdnZXN0aW9uID0gJyc7XG4gICAgbGV0IGxldmVsOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCcgPSAnbmV1dHJhbCc7XG5cbiAgICAvLyDmoLnmja7moLzlsYDnsbvlnovlkozlpKfov5DkupTooYzlhbPns7vov5vooYzlhbfkvZPliIbmnpBcbiAgICBzd2l0Y2ggKGdlSnUpIHtcbiAgICAgIGNhc2UgJ+ato+WNsOagvCc6XG4gICAgICBjYXNlICflgY/ljbDmoLwnOlxuICAgICAgY2FzZSAn5Y2w57u25qC8JzpcbiAgICAgICAgaWYgKHJlbGF0aW9uc2hpcCA9PT0gJ+eUnycpIHtcbiAgICAgICAgICBlZmZlY3QgPSBg5aSn6L+Q5LqU6KGMJHtkYVl1bld1WGluZ33nlJ/ml6XkuLvkupTooYwke3JpWmh1V3VYaW5nfe+8jOWinuW8uuWNsOaYn+eUn+WKqeaXpeS4u+eahOWKm+mHj++8jOWvuSR7Z2VKdX3mnInliKnjgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5q2k5aSn6L+Q5pyf6Ze077yM5Y+v5Lul6YeN54K55Y+R5bGV5pWZ6IKy44CB5paH5YyW44CB6KGM5pS/562J5Y2w5pif5pyJ5Yip55qE5LqL5Lia44CCJztcbiAgICAgICAgICBsZXZlbCA9ICdnb29kJztcbiAgICAgICAgfSBlbHNlIGlmIChyZWxhdGlvbnNoaXAgPT09ICflhYsnKSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOWkp+i/kOS6lOihjCR7ZGFZdW5XdVhpbmd95YWL5pel5Li75LqU6KGMJHtyaVpodVd1WGluZ33vvIzliYrlvLHljbDmmJ/nlJ/liqnml6XkuLvnmoTlipvph4/vvIzlr7kke2dlSnV95LiN5Yip44CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+atpOWkp+i/kOacn+mXtO+8jOmcgOimgeazqOaEj+S/neaKpOiHquW3se+8jOmBv+WFjei/h+W6puWKs+e0r++8jOmAguW9k+iwg+aVtOS6i+S4muaWueWQkeOAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnYmFkJztcbiAgICAgICAgfSBlbHNlIGlmIChyZWxhdGlvbnNoaXAgPT09ICfooqvnlJ8nKSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOWkp+i/kOS6lOihjCR7ZGFZdW5XdVhpbmd96KKr5pel5Li75LqU6KGMJHtyaVpodVd1WGluZ33miYDnlJ/vvIzml6XkuLvms4TmsJTov4flpJrvvIzlr7kke2dlSnV95LiN5Yip44CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+atpOWkp+i/kOacn+mXtO+8jOmcgOimgeazqOaEj+S/neWtmOWunuWKm++8jOmBv+WFjei/h+W6puS7mOWHuu+8jOmAguW9k+iwg+aVtOS6i+S4muaWueWQkeOAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnYmFkJztcbiAgICAgICAgfSBlbHNlIGlmIChyZWxhdGlvbnNoaXAgPT09ICfooqvlhYsnKSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOWkp+i/kOS6lOihjCR7ZGFZdW5XdVhpbmd96KKr5pel5Li75LqU6KGMJHtyaVpodVd1WGluZ33miYDlhYvvvIzml6XkuLvlvpfku6Xlj5HmjKXvvIzlr7kke2dlSnV95Lit5oCn5b2x5ZON44CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+atpOWkp+i/kOacn+mXtO+8jOWPr+S7pemAguW6puWPkeWxleS6i+S4mu+8jOS9humcgOimgeazqOaEj+W5s+ihoeWQhOaWuemdoueahOWFs+ezu+OAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnbmV1dHJhbCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOWkp+i/kOS6lOihjCR7ZGFZdW5XdVhpbmd95LiO5pel5Li75LqU6KGMJHtyaVpodVd1WGluZ33nm7jlkIzvvIzlop7lvLrml6XkuLvlipvph4/vvIzlr7kke2dlSnV95Lit5oCn5b2x5ZON44CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+atpOWkp+i/kOacn+mXtO+8jOmcgOimgeazqOaEj+mBv+WFjeaXpeS4u+i/h+aXuu+8jOmAguW9k+WPkeWxleazhOengOS5i+S6i+S4muOAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnbmV1dHJhbCc7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIOWPr+S7pee7p+e7rea3u+WKoOWFtuS7luagvOWxgOexu+Wei+eahOWIhuaekC4uLlxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBlZmZlY3QgPSBg6ZyA6KaB57uT5ZCI5YW35L2T5YWr5a2X5ZKM5aSn6L+Q5bmy5pSv6L+b6KGM6K+m57uG5YiG5p6Q44CCYDtcbiAgICAgICAgc3VnZ2VzdGlvbiA9ICflu7rorq7lkqjor6LkuJPkuJrlkb3nkIbluIjov5vooYzor6bnu4bliIbmnpDjgIInO1xuICAgICAgICBsZXZlbCA9ICduZXV0cmFsJztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZWZmZWN0LFxuICAgICAgc3VnZ2VzdGlvbixcbiAgICAgIGxldmVsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blpKnlubLkupTooYxcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0U3RlbVd1WGluZyhzdGVtOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHN0ZW1XdVhpbmdNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICfmnKgnLCAn5LmZJzogJ+acqCcsXG4gICAgICAn5LiZJzogJ+eBqycsICfkuIEnOiAn54GrJyxcbiAgICAgICfmiIonOiAn5ZyfJywgJ+W3sSc6ICflnJ8nLFxuICAgICAgJ+W6mic6ICfph5EnLCAn6L6bJzogJ+mHkScsXG4gICAgICAn5aOsJzogJ+awtCcsICfnmbgnOiAn5rC0J1xuICAgIH07XG5cbiAgICByZXR1cm4gc3RlbVd1WGluZ01hcFtzdGVtXSB8fCAn5pyq55+lJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliIbmnpDmtYHlubTlr7nmoLzlsYDnmoTlvbHlk41cbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqIEBwYXJhbSBsaXVOaWFuR2FuWmhpIOa1geW5tOW5suaUr1xuICAgKiBAcGFyYW0gcmlaaHVXdVhpbmcg5pel5Li75LqU6KGMXG4gICAqIEByZXR1cm5zIOa1geW5tOWvueagvOWxgOeahOW9seWTjeWIhuaekFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhbmFseXplTGl1TmlhbkVmZmVjdChnZUp1OiBzdHJpbmcsIGxpdU5pYW5HYW5aaGk6IHN0cmluZywgcmlaaHVXdVhpbmc6IHN0cmluZyk6IHtcbiAgICBlZmZlY3Q6IHN0cmluZztcbiAgICBzdWdnZXN0aW9uOiBzdHJpbmc7XG4gICAgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJztcbiAgfSB7XG4gICAgaWYgKCFnZUp1IHx8ICFsaXVOaWFuR2FuWmhpIHx8ICFyaVpodVd1WGluZyB8fCBsaXVOaWFuR2FuWmhpLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVmZmVjdDogJ+aXoOazleWIhuaekOa1geW5tOWvueagvOWxgOeahOW9seWTje+8jOS/oeaBr+S4jei2s+OAgicsXG4gICAgICAgIHN1Z2dlc3Rpb246ICfor7fmj5DkvpvlrozmlbTnmoTmoLzlsYDjgIHmtYHlubTlubLmlK/lkozml6XkuLvkupTooYzkv6Hmga/jgIInLFxuICAgICAgICBsZXZlbDogJ25ldXRyYWwnXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIOiOt+WPlua1geW5tOWkqeW5suWSjOWcsOaUr1xuICAgIGNvbnN0IGxpdU5pYW5HYW4gPSBsaXVOaWFuR2FuWmhpWzBdOyAvLyDlpKnlubJcbiAgICBjb25zdCBsaXVOaWFuWmhpID0gbGl1TmlhbkdhblpoaVsxXTsgLy8g5Zyw5pSvXG5cbiAgICAvLyDojrflj5bmtYHlubTlpKnlubLkupTooYxcbiAgICBjb25zdCBsaXVOaWFuV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGxpdU5pYW5HYW4pO1xuXG4gICAgLy8g5YiG5p6Q5rWB5bm05LqU6KGM5LiO5pel5Li75LqU6KGM55qE5YWz57O7XG4gICAgY29uc3QgcmVsYXRpb25zaGlwID0gdGhpcy5nZXRXdVhpbmdSZWxhdGlvbnNoaXAobGl1Tmlhbld1WGluZywgcmlaaHVXdVhpbmcpO1xuXG4gICAgLy8g5qC55o2u5qC85bGA57G75Z6L5ZKM5rWB5bm05LqU6KGM5YWz57O76L+b6KGM5YiG5p6QXG4gICAgbGV0IGVmZmVjdCA9ICcnO1xuICAgIGxldCBzdWdnZXN0aW9uID0gJyc7XG4gICAgbGV0IGxldmVsOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCcgPSAnbmV1dHJhbCc7XG5cbiAgICAvLyDmoLnmja7moLzlsYDnsbvlnovlkozmtYHlubTkupTooYzlhbPns7vov5vooYzlhbfkvZPliIbmnpBcbiAgICBzd2l0Y2ggKGdlSnUpIHtcbiAgICAgIGNhc2UgJ+ato+WNsOagvCc6XG4gICAgICBjYXNlICflgY/ljbDmoLwnOlxuICAgICAgY2FzZSAn5Y2w57u25qC8JzpcbiAgICAgICAgaWYgKHJlbGF0aW9uc2hpcCA9PT0gJ+eUnycpIHtcbiAgICAgICAgICBlZmZlY3QgPSBg5rWB5bm05LqU6KGMJHtsaXVOaWFuV3VYaW5nfeeUn+aXpeS4u+S6lOihjCR7cmlaaHVXdVhpbmd977yM5aKe5by65Y2w5pif55Sf5Yqp5pel5Li755qE5Yqb6YeP77yM5a+5JHtnZUp1feacieWIqeOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICfmraTmtYHlubTmnJ/pl7TvvIzlj6/ku6Xph43ngrnlj5HlsZXmlZnogrLjgIHmlofljJbjgIHooYzmlL/nrYnljbDmmJ/mnInliKnnmoTkuovkuJrjgIInO1xuICAgICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aW9uc2hpcCA9PT0gJ+WFiycpIHtcbiAgICAgICAgICBlZmZlY3QgPSBg5rWB5bm05LqU6KGMJHtsaXVOaWFuV3VYaW5nfeWFi+aXpeS4u+S6lOihjCR7cmlaaHVXdVhpbmd977yM5YmK5byx5Y2w5pif55Sf5Yqp5pel5Li755qE5Yqb6YeP77yM5a+5JHtnZUp1feS4jeWIqeOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICfmraTmtYHlubTmnJ/pl7TvvIzpnIDopoHms6jmhI/kv53miqToh6rlt7HvvIzpgb/lhY3ov4fluqblirPntK/vvIzpgILlvZPosIPmlbTkuovkuJrmlrnlkJHjgIInO1xuICAgICAgICAgIGxldmVsID0gJ2JhZCc7XG4gICAgICAgIH0gZWxzZSBpZiAocmVsYXRpb25zaGlwID09PSAn6KKr55SfJykge1xuICAgICAgICAgIGVmZmVjdCA9IGDmtYHlubTkupTooYwke2xpdU5pYW5XdVhpbmd96KKr5pel5Li75LqU6KGMJHtyaVpodVd1WGluZ33miYDnlJ/vvIzml6XkuLvms4TmsJTov4flpJrvvIzlr7kke2dlSnV95LiN5Yip44CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+atpOa1geW5tOacn+mXtO+8jOmcgOimgeazqOaEj+S/neWtmOWunuWKm++8jOmBv+WFjei/h+W6puS7mOWHuu+8jOmAguW9k+iwg+aVtOS6i+S4muaWueWQkeOAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnYmFkJztcbiAgICAgICAgfSBlbHNlIGlmIChyZWxhdGlvbnNoaXAgPT09ICfooqvlhYsnKSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOa1geW5tOS6lOihjCR7bGl1Tmlhbld1WGluZ33ooqvml6XkuLvkupTooYwke3JpWmh1V3VYaW5nfeaJgOWFi++8jOaXpeS4u+W+l+S7peWPkeaMpe+8jOWvuSR7Z2VKdX3kuK3mgKflvbHlk43jgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5q2k5rWB5bm05pyf6Ze077yM5Y+v5Lul6YCC5bqm5Y+R5bGV5LqL5Lia77yM5L2G6ZyA6KaB5rOo5oSP5bmz6KGh5ZCE5pa56Z2i55qE5YWz57O744CCJztcbiAgICAgICAgICBsZXZlbCA9ICduZXV0cmFsJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlZmZlY3QgPSBg5rWB5bm05LqU6KGMJHtsaXVOaWFuV3VYaW5nfeS4juaXpeS4u+S6lOihjCR7cmlaaHVXdVhpbmd955u45ZCM77yM5aKe5by65pel5Li75Yqb6YeP77yM5a+5JHtnZUp1feS4reaAp+W9seWTjeOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICfmraTmtYHlubTmnJ/pl7TvvIzpnIDopoHms6jmhI/pgb/lhY3ml6XkuLvov4fml7rvvIzpgILlvZPlj5HlsZXms4Tnp4DkuYvkuovkuJrjgIInO1xuICAgICAgICAgIGxldmVsID0gJ25ldXRyYWwnO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfmraPlrpjmoLwnOlxuICAgICAgY2FzZSAn5LiD5p2A5qC8JzpcbiAgICAgICAgaWYgKHJlbGF0aW9uc2hpcCA9PT0gJ+iiq+WFiycpIHtcbiAgICAgICAgICBlZmZlY3QgPSBg5rWB5bm05LqU6KGMJHtsaXVOaWFuV3VYaW5nfeiiq+aXpeS4u+S6lOihjCR7cmlaaHVXdVhpbmd95omA5YWL77yM5aKe5by65pel5Li75a+55a6Y5p2A55qE5YWL5Yi277yM5a+5JHtnZUp1feacieWIqeOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICfmraTmtYHlubTmnJ/pl7TvvIzlj6/ku6Xph43ngrnlj5HlsZXooYzmlL/jgIHnrqHnkIbjgIHlhpvorabnrYnlrpjmnYDmnInliKnnmoTkuovkuJrjgIInO1xuICAgICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aW9uc2hpcCA9PT0gJ+WFiycpIHtcbiAgICAgICAgICBlZmZlY3QgPSBg5rWB5bm05LqU6KGMJHtsaXVOaWFuV3VYaW5nfeWFi+aXpeS4u+S6lOihjCR7cmlaaHVXdVhpbmd977yM5aKe5by65a6Y5p2A5a+55pel5Li755qE5YWL5Yi277yM5a+5JHtnZUp1feS4jeWIqeOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICfmraTmtYHlubTmnJ/pl7TvvIzpnIDopoHms6jmhI/kv53miqToh6rlt7HvvIzpgb/lhY3ov4fluqblirPntK/vvIzpgILlvZPosIPmlbTkuovkuJrmlrnlkJHjgIInO1xuICAgICAgICAgIGxldmVsID0gJ2JhZCc7XG4gICAgICAgIH0gZWxzZSBpZiAocmVsYXRpb25zaGlwID09PSAn55SfJykge1xuICAgICAgICAgIGVmZmVjdCA9IGDmtYHlubTkupTooYwke2xpdU5pYW5XdVhpbmd955Sf5pel5Li75LqU6KGMJHtyaVpodVd1WGluZ33vvIzlop7lvLrml6XkuLvlipvph4/vvIzlr7kke2dlSnV95Lit5oCn5b2x5ZON44CCYDtcbiAgICAgICAgICBzdWdnZXN0aW9uID0gJ+atpOa1geW5tOacn+mXtO+8jOWPr+S7pemAguW6puWPkeWxleS6i+S4mu+8jOS9humcgOimgeazqOaEj+W5s+ihoeWQhOaWuemdoueahOWFs+ezu+OAgic7XG4gICAgICAgICAgbGV2ZWwgPSAnbmV1dHJhbCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOa1geW5tOS6lOihjCR7bGl1Tmlhbld1WGluZ33kuI7ml6XkuLvkupTooYwke3JpWmh1V3VYaW5nfeWFs+ezu+i+g+S4uuWkjeadgu+8jOmcgOimgeWFt+S9k+WIhuaekOOAgmA7XG4gICAgICAgICAgc3VnZ2VzdGlvbiA9ICfmraTmtYHlubTmnJ/pl7TvvIzpnIDopoHmoLnmja7lhbfkvZPmg4XlhrXosIPmlbTkuovkuJrmlrnlkJHjgIInO1xuICAgICAgICAgIGxldmVsID0gJ25ldXRyYWwnO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfotKLlrpjlj4znvo7moLwnOlxuICAgICAgICBpZiAocmVsYXRpb25zaGlwID09PSAn6KKr5YWLJyB8fCByZWxhdGlvbnNoaXAgPT09ICfooqvnlJ8nKSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOa1geW5tOS6lOihjCR7bGl1Tmlhbld1WGluZ33ooqvml6XkuLvkupTooYwke3JpWmh1V3VYaW5nfeaJgOWFi+aIluaJgOeUn++8jOWinuW8uuaXpeS4u+Wvuei0ouWumOeahOaOp+WItu+8jOWvuSR7Z2VKdX3mnInliKnjgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5q2k5rWB5bm05pyf6Ze077yM5Y+v5Lul6YeN54K55Y+R5bGV5pS/5ZWG5Lik55WM55qE5bel5L2c77yM5aaC5LyB5Lia566h55CG44CB6YeR6J6N5oqV6LWE44CB5pS/5bqc5py65YWz562J44CCJztcbiAgICAgICAgICBsZXZlbCA9ICdnb29kJztcbiAgICAgICAgfSBlbHNlIGlmIChyZWxhdGlvbnNoaXAgPT09ICflhYsnKSB7XG4gICAgICAgICAgZWZmZWN0ID0gYOa1geW5tOS6lOihjCR7bGl1Tmlhbld1WGluZ33lhYvml6XkuLvkupTooYwke3JpWmh1V3VYaW5nfe+8jOWJiuW8seaXpeS4u+Wvuei0ouWumOeahOaOp+WItu+8jOWvuSR7Z2VKdX3kuI3liKnjgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5q2k5rWB5bm05pyf6Ze077yM6ZyA6KaB5rOo5oSP5L+d5oqk6Ieq5bex77yM6YG/5YWN6L+H5bqm5Yqz57Sv77yM6YCC5b2T6LCD5pW05LqL5Lia5pa55ZCR44CCJztcbiAgICAgICAgICBsZXZlbCA9ICdiYWQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVmZmVjdCA9IGDmtYHlubTkupTooYwke2xpdU5pYW5XdVhpbmd95LiO5pel5Li75LqU6KGMJHtyaVpodVd1WGluZ33lhbPns7vovoPkuLrlpI3mnYLvvIzpnIDopoHlhbfkvZPliIbmnpDjgIJgO1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSAn5q2k5rWB5bm05pyf6Ze077yM6ZyA6KaB5qC55o2u5YW35L2T5oOF5Ya16LCD5pW05LqL5Lia5pa55ZCR44CCJztcbiAgICAgICAgICBsZXZlbCA9ICduZXV0cmFsJztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgLy8g5Y+v5Lul57un57ut5re75Yqg5YW25LuW5qC85bGA57G75Z6L55qE5YiG5p6QLi4uXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGVmZmVjdCA9IGDpnIDopoHnu5PlkIjlhbfkvZPlhavlrZflkozmtYHlubTlubLmlK/ov5vooYzor6bnu4bliIbmnpDjgIJgO1xuICAgICAgICBzdWdnZXN0aW9uID0gJ+W7uuiuruWSqOivouS4k+S4muWRveeQhuW4iOi/m+ihjOivpue7huWIhuaekOOAgic7XG4gICAgICAgIGxldmVsID0gJ25ldXRyYWwnO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBlZmZlY3QsXG4gICAgICBzdWdnZXN0aW9uLFxuICAgICAgbGV2ZWxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIOWIhuaekOagvOWxgOWPmOWMlui2i+WKv1xuICAgKiBAcGFyYW0gZ2VKdSDmoLzlsYDlkI3np7BcbiAgICogQHBhcmFtIHJpWmh1V3VYaW5nIOaXpeS4u+S6lOihjFxuICAgKiBAcGFyYW0gZGFZdW5MaXN0IOWkp+i/kOWIl+ihqO+8jOavj+S4quWFg+e0oOWMheWQq+W5suaUr+WSjOW5tOS7vVxuICAgKiBAcmV0dXJucyDmoLzlsYDlj5jljJbotovlir/liIbmnpBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYW5hbHl6ZUdlSnVUcmVuZChcbiAgICBnZUp1OiBzdHJpbmcsXG4gICAgcmlaaHVXdVhpbmc6IHN0cmluZyxcbiAgICBkYVl1bkxpc3Q6IHtnYW5aaGk6IHN0cmluZzsgc3RhcnRZZWFyOiBudW1iZXI7IGVuZFllYXI6IG51bWJlcn1bXVxuICApOiB7XG4gICAgdHJlbmQ6IHN0cmluZztcbiAgICBrZXlZZWFyczoge3llYXI6IG51bWJlcjsgZXZlbnQ6IHN0cmluZzsgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJ31bXTtcbiAgICBzdWdnZXN0aW9uOiBzdHJpbmc7XG4gIH0ge1xuICAgIGlmICghZ2VKdSB8fCAhcmlaaHVXdVhpbmcgfHwgIWRhWXVuTGlzdCB8fCBkYVl1bkxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0cmVuZDogJ+aXoOazleWIhuaekOagvOWxgOWPmOWMlui2i+WKv++8jOS/oeaBr+S4jei2s+OAgicsXG4gICAgICAgIGtleVllYXJzOiBbXSxcbiAgICAgICAgc3VnZ2VzdGlvbjogJ+ivt+aPkOS+m+WujOaVtOeahOagvOWxgOOAgeaXpeS4u+S6lOihjOWSjOWkp+i/kOS/oeaBr+OAgidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8g5YiG5p6Q5q+P5Liq5aSn6L+Q5a+55qC85bGA55qE5b2x5ZONXG4gICAgY29uc3QgZGFZdW5FZmZlY3RzID0gZGFZdW5MaXN0Lm1hcChkYVl1biA9PiB7XG4gICAgICBjb25zdCBlZmZlY3QgPSB0aGlzLmFuYWx5emVEYVl1bkVmZmVjdChnZUp1LCBkYVl1bi5nYW5aaGksIHJpWmh1V3VYaW5nKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmVmZmVjdCxcbiAgICAgICAgc3RhcnRZZWFyOiBkYVl1bi5zdGFydFllYXIsXG4gICAgICAgIGVuZFllYXI6IGRhWXVuLmVuZFllYXIsXG4gICAgICAgIGdhblpoaTogZGFZdW4uZ2FuWmhpXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8g5om+5Ye65YWz6ZSu5bm05Lu977yI5aSn6L+Q5Lqk5o6l5bm077yJXG4gICAgY29uc3Qga2V5WWVhcnMgPSBkYVl1bkVmZmVjdHMubWFwKChlZmZlY3QsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB5ZWFyOiBlZmZlY3Quc3RhcnRZZWFyLFxuICAgICAgICAgIGV2ZW50OiBg6L+b5YWlJHtlZmZlY3QuZ2FuWmhpfeWkp+i/kO+8jCR7ZWZmZWN0LmVmZmVjdH1gLFxuICAgICAgICAgIGxldmVsOiBlZmZlY3QubGV2ZWxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeWVhcjogZWZmZWN0LnN0YXJ0WWVhcixcbiAgICAgICAgICBldmVudDogYOS7jiR7ZGFZdW5FZmZlY3RzW2luZGV4LTFdLmdhblpoaX3lpKfov5Dov5vlhaUke2VmZmVjdC5nYW5aaGl95aSn6L+Q77yMJHtlZmZlY3QuZWZmZWN0fWAsXG4gICAgICAgICAgbGV2ZWw6IGVmZmVjdC5sZXZlbFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8g5YiG5p6Q5pW05L2T6LaL5Yq/XG4gICAgbGV0IHRyZW5kID0gJyc7XG4gICAgY29uc3QgZ29vZERhWXVuID0gZGFZdW5FZmZlY3RzLmZpbHRlcihlZmZlY3QgPT4gZWZmZWN0LmxldmVsID09PSAnZ29vZCcpLmxlbmd0aDtcbiAgICBjb25zdCBiYWREYVl1biA9IGRhWXVuRWZmZWN0cy5maWx0ZXIoZWZmZWN0ID0+IGVmZmVjdC5sZXZlbCA9PT0gJ2JhZCcpLmxlbmd0aDtcbiAgICBjb25zdCBuZXV0cmFsRGFZdW4gPSBkYVl1bkVmZmVjdHMuZmlsdGVyKGVmZmVjdCA9PiBlZmZlY3QubGV2ZWwgPT09ICduZXV0cmFsJyB8fCBlZmZlY3QubGV2ZWwgPT09ICdtaXhlZCcpLmxlbmd0aDtcblxuICAgIGlmIChnb29kRGFZdW4gPiBiYWREYVl1biAmJiBnb29kRGFZdW4gPiBuZXV0cmFsRGFZdW4pIHtcbiAgICAgIHRyZW5kID0gYOaVtOS9k+adpeeci++8jCR7Z2VKdX3lnKjmnKrmnaXlpKfov5DkuK3lj5HlsZXotovlir/oia/lpb3vvIzmnInliKnkuo7kuovkuJrlj5HlsZXlkozkuKrkurrmiJDplb/jgIJgO1xuICAgIH0gZWxzZSBpZiAoYmFkRGFZdW4gPiBnb29kRGFZdW4gJiYgYmFkRGFZdW4gPiBuZXV0cmFsRGFZdW4pIHtcbiAgICAgIHRyZW5kID0gYOaVtOS9k+adpeeci++8jCR7Z2VKdX3lnKjmnKrmnaXlpKfov5DkuK3lj5HlsZXotovlir/kuI3kvbPvvIzpnIDopoHms6jmhI/osIPmlbTlkozlupTlr7njgIJgO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmVuZCA9IGDmlbTkvZPmnaXnnIvvvIwke2dlSnV95Zyo5pyq5p2l5aSn6L+Q5Lit5Y+R5bGV6LaL5Yq/6LW35LyP5LiN5a6a77yM6ZyA6KaB5qC55o2u5YW35L2T5aSn6L+Q54G15rS76LCD5pW044CCYDtcbiAgICB9XG5cbiAgICAvLyDmj5Dkvpvlu7rorq5cbiAgICBsZXQgc3VnZ2VzdGlvbiA9ICcnO1xuICAgIGlmIChnb29kRGFZdW4gPiBiYWREYVl1bikge1xuICAgICAgc3VnZ2VzdGlvbiA9IGDlu7rorq7lnKjmnInliKnlpKfov5DmnJ/pl7Tnp6/mnoHlj5HlsZXkuovkuJrvvIzlnKjkuI3liKnlpKfov5DmnJ/pl7Tms6jmhI/osIPmlbTlkozkv53lrojjgILnibnliKvmmK/lnKgke2tleVllYXJzLmZpbHRlcih5ZWFyID0+IHllYXIubGV2ZWwgPT09ICdnb29kJykubWFwKHllYXIgPT4geWVhci55ZWFyKS5qb2luKCflubTjgIEnKX3lubTnrYnlhbPplK7lubTku73vvIzlj6/ku6XmnInmiYDkvZzkuLrjgIJgO1xuICAgIH0gZWxzZSBpZiAoYmFkRGFZdW4gPiBnb29kRGFZdW4pIHtcbiAgICAgIHN1Z2dlc3Rpb24gPSBg5bu66K6u5Zyo5LiN5Yip5aSn6L+Q5pyf6Ze05L+d5a6I6KGM5LqL77yM5rOo5oSP6LCD5pW05b+D5oCB5ZKM5pa55ZCR44CC54m55Yir5piv5ZyoJHtrZXlZZWFycy5maWx0ZXIoeWVhciA9PiB5ZWFyLmxldmVsID09PSAnYmFkJykubWFwKHllYXIgPT4geWVhci55ZWFyKS5qb2luKCflubTjgIEnKX3lubTnrYnlhbPplK7lubTku73vvIzpnIDopoHnibnliKvosKjmhY7jgIJgO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWdnZXN0aW9uID0gYOW7uuiuruagueaNruWFt+S9k+Wkp+i/kOeBtea0u+iwg+aVtOetlueVpe+8jOWcqOacieWIqeaXtuacn+enr+aegei/m+WPlu+8jOWcqOS4jeWIqeaXtuacn+S/neWuiOihjOS6i+OAgmA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRyZW5kLFxuICAgICAga2V5WWVhcnMsXG4gICAgICBzdWdnZXN0aW9uXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkupTooYzkuYvpl7TnmoTlhbPns7tcbiAgICogQHBhcmFtIHd1WGluZzEg5LqU6KGMMVxuICAgKiBAcGFyYW0gd3VYaW5nMiDkupTooYwyXG4gICAqIEByZXR1cm5zIOWFs+ezu+exu+Wei++8mifnlJ8n44CBJ+WFiyfjgIEn6KKr55SfJ+OAgSfooqvlhYsn44CBJ+WQjCdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFd1WGluZ1JlbGF0aW9uc2hpcCh3dVhpbmcxOiBzdHJpbmcsIHd1WGluZzI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHd1WGluZzEgPT09IHd1WGluZzIpIHtcbiAgICAgIHJldHVybiAn5ZCMJztcbiAgICB9XG5cbiAgICAvLyDkupTooYznm7jnlJ/lhbPns7vvvJrmnKjnlJ/ngavvvIzngavnlJ/lnJ/vvIzlnJ/nlJ/ph5HvvIzph5HnlJ/msLTvvIzmsLTnlJ/mnKhcbiAgICBjb25zdCBzaGVuZ1JlbGF0aW9uczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5pyoJzogJ+eBqycsXG4gICAgICAn54GrJzogJ+WcnycsXG4gICAgICAn5ZyfJzogJ+mHkScsXG4gICAgICAn6YeRJzogJ+awtCcsXG4gICAgICAn5rC0JzogJ+acqCdcbiAgICB9O1xuXG4gICAgLy8g5LqU6KGM55u45YWL5YWz57O777ya5pyo5YWL5Zyf77yM5Zyf5YWL5rC077yM5rC05YWL54Gr77yM54Gr5YWL6YeR77yM6YeR5YWL5pyoXG4gICAgY29uc3Qga2VSZWxhdGlvbnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+acqCc6ICflnJ8nLFxuICAgICAgJ+Wcnyc6ICfmsLQnLFxuICAgICAgJ+awtCc6ICfngasnLFxuICAgICAgJ+eBqyc6ICfph5EnLFxuICAgICAgJ+mHkSc6ICfmnKgnXG4gICAgfTtcblxuICAgIGlmIChzaGVuZ1JlbGF0aW9uc1t3dVhpbmcxXSA9PT0gd3VYaW5nMikge1xuICAgICAgcmV0dXJuICfnlJ8nO1xuICAgIH0gZWxzZSBpZiAoa2VSZWxhdGlvbnNbd3VYaW5nMV0gPT09IHd1WGluZzIpIHtcbiAgICAgIHJldHVybiAn5YWLJztcbiAgICB9IGVsc2UgaWYgKHNoZW5nUmVsYXRpb25zW3d1WGluZzJdID09PSB3dVhpbmcxKSB7XG4gICAgICByZXR1cm4gJ+iiq+eUnyc7XG4gICAgfSBlbHNlIGlmIChrZVJlbGF0aW9uc1t3dVhpbmcyXSA9PT0gd3VYaW5nMSkge1xuICAgICAgcmV0dXJuICfooqvlhYsnO1xuICAgIH1cblxuICAgIHJldHVybiAn5pyq55+lJztcbiAgfVxufVxuIl19