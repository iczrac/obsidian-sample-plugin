/**
 * 格局趋势分析服务
 * 提供格局随大运、流年变化的趋势分析
 */
import { GeJuService } from './GeJuService';

export interface TrendPoint {
  year: number;
  strength: number;
  level: 'good' | 'bad' | 'neutral' | 'mixed';
  event?: string;
}

export interface GeJuTrendData {
  trend: TrendPoint[];
  keyYears: {
    year: number;
    event: string;
    level: 'good' | 'bad' | 'neutral' | 'mixed';
  }[];
  analysis: string;
  suggestion: string;
}

export class GeJuTrendService {
  /**
   * 生成格局趋势数据
   * @param geJu 格局名称
   * @param riZhuWuXing 日主五行
   * @param birthYear 出生年份
   * @param daYunList 大运列表
   * @param years 分析年数（默认20年）
   * @returns 格局趋势数据
   */
  public static generateTrendData(
    geJu: string,
    riZhuWuXing: string,
    birthYear: number,
    daYunList: { ganZhi: string; startYear: number; endYear: number }[],
    years: number = 20
  ): GeJuTrendData {
    if (!geJu || !riZhuWuXing || !daYunList || daYunList.length === 0) {
      return {
        trend: [],
        keyYears: [],
        analysis: '无法分析格局趋势，信息不足。',
        suggestion: '请提供完整的格局、日主五行和大运信息。'
      };
    }

    const currentYear = new Date().getFullYear();
    const startYear = currentYear;
    const endYear = currentYear + years;

    // 获取大运影响
    const daYunEffects = this.getDaYunEffects(geJu, riZhuWuXing, daYunList, startYear, endYear);

    // 生成趋势点
    const trend: TrendPoint[] = [];
    for (let year = startYear; year <= endYear; year++) {
      // 找到当前年份所在的大运
      const currentDaYun = daYunList.find(
        daYun => year >= daYun.startYear && year <= daYun.endYear
      );

      if (!currentDaYun) {
        continue;
      }

      // 计算当前年份在大运中的位置（0-1之间）
      const daYunProgress =
        (year - currentDaYun.startYear) /
        (currentDaYun.endYear - currentDaYun.startYear);

      // 获取大运效应强度
      const daYunEffect = daYunEffects.find(effect => effect.ganZhi === currentDaYun.ganZhi);
      let strength = 0;
      let level: 'good' | 'bad' | 'neutral' | 'mixed' = 'neutral';

      if (daYunEffect) {
        // 根据大运效应级别设置基础强度
        switch (daYunEffect.level) {
          case 'good':
            strength = 0.7;
            level = 'good';
            break;
          case 'bad':
            strength = -0.7;
            level = 'bad';
            break;
          case 'mixed':
            strength = 0.2;
            level = 'mixed';
            break;
          default:
            strength = 0;
            level = 'neutral';
        }

        // 根据大运进展调整强度（大运初期影响较小，中期最强，后期减弱）
        const progressFactor = 1 - Math.abs(daYunProgress - 0.5) * 0.5;
        strength *= progressFactor;

        // 添加流年影响（简化模拟，实际应该根据具体流年干支计算）
        const yearVariation = Math.sin(year * 0.5) * 0.3; // 简单的周期性变化
        strength += yearVariation;

        // 限制强度范围在-1到1之间
        strength = Math.max(-1, Math.min(1, strength));

        // 根据强度调整级别
        if (strength > 0.5) {
          level = 'good';
        } else if (strength < -0.5) {
          level = 'bad';
        } else if (strength >= -0.2 && strength <= 0.2) {
          level = 'neutral';
        } else {
          level = 'mixed';
        }
      }

      // 添加趋势点
      trend.push({
        year,
        strength,
        level
      });
    }

    // 找出关键年份
    const keyYears = this.getKeyYears(geJu, riZhuWuXing, daYunList, startYear, endYear);

    // 分析整体趋势
    const analysis = this.analyzeTrend(trend, geJu);

    // 提供建议
    const suggestion = this.provideSuggestion(trend, keyYears, geJu);

    return {
      trend,
      keyYears,
      analysis,
      suggestion
    };
  }

  /**
   * 获取大运影响
   * @param geJu 格局名称
   * @param riZhuWuXing 日主五行
   * @param daYunList 大运列表
   * @param startYear 开始年份
   * @param endYear 结束年份
   * @returns 大运影响列表
   */
  private static getDaYunEffects(
    geJu: string,
    riZhuWuXing: string,
    daYunList: { ganZhi: string; startYear: number; endYear: number }[],
    startYear: number,
    endYear: number
  ): {
    ganZhi: string;
    effect: string;
    level: 'good' | 'bad' | 'neutral' | 'mixed';
  }[] {
    return daYunList
      .filter(daYun => daYun.endYear >= startYear && daYun.startYear <= endYear)
      .map(daYun => {
        const effect = GeJuService.analyzeDaYunEffect(geJu, daYun.ganZhi, riZhuWuXing);
        return {
          ganZhi: daYun.ganZhi,
          effect: effect.effect,
          level: effect.level
        };
      });
  }

  /**
   * 获取关键年份
   * @param geJu 格局名称
   * @param riZhuWuXing 日主五行
   * @param daYunList 大运列表
   * @param startYear 开始年份
   * @param endYear 结束年份
   * @returns 关键年份列表
   */
  private static getKeyYears(
    geJu: string,
    riZhuWuXing: string,
    daYunList: { ganZhi: string; startYear: number; endYear: number }[],
    startYear: number,
    endYear: number
  ): {
    year: number;
    event: string;
    level: 'good' | 'bad' | 'neutral' | 'mixed';
  }[] {
    const keyYears: {
      year: number;
      event: string;
      level: 'good' | 'bad' | 'neutral' | 'mixed';
    }[] = [];

    // 添加大运交接年
    daYunList.forEach((daYun, index) => {
      if (daYun.startYear >= startYear && daYun.startYear <= endYear) {
        const effect = GeJuService.analyzeDaYunEffect(geJu, daYun.ganZhi, riZhuWuXing);
        let event = '';
        if (index === 0) {
          event = `进入${daYun.ganZhi}大运，${effect.effect}`;
        } else {
          event = `从${daYunList[index - 1].ganZhi}大运进入${daYun.ganZhi}大运，${effect.effect}`;
        }
        keyYears.push({
          year: daYun.startYear,
          event,
          level: effect.level
        });
      }
    });

    // 添加一些重要流年（简化模拟，实际应该根据具体流年干支计算）
    for (let year = startYear; year <= endYear; year++) {
      // 找到当前年份所在的大运
      const currentDaYun = daYunList.find(
        daYun => year >= daYun.startYear && year <= daYun.endYear
      );

      if (!currentDaYun) {
        continue;
      }

      // 模拟一些重要流年（例如，每5年一个重要节点）
      if ((year - startYear) % 5 === 0 && !keyYears.some(key => key.year === year)) {
        const daYunEffect = GeJuService.analyzeDaYunEffect(
          geJu,
          currentDaYun.ganZhi,
          riZhuWuXing
        );
        keyYears.push({
          year,
          event: `${year}年流年，${daYunEffect.effect}`,
          level: daYunEffect.level
        });
      }
    }

    return keyYears.sort((a, b) => a.year - b.year);
  }

  /**
   * 分析趋势
   * @param trend 趋势数据
   * @param geJu 格局名称
   * @returns 趋势分析
   */
  private static analyzeTrend(trend: TrendPoint[], geJu: string): string {
    if (trend.length === 0) {
      return '无法分析格局趋势，数据不足。';
    }

    const goodYears = trend.filter(point => point.level === 'good').length;
    const badYears = trend.filter(point => point.level === 'bad').length;
    const neutralYears = trend.filter(
      point => point.level === 'neutral' || point.level === 'mixed'
    ).length;

    if (goodYears > badYears && goodYears > neutralYears) {
      return `整体来看，${geJu}在未来${trend.length}年中发展趋势良好，有利于事业发展和个人成长。`;
    } else if (badYears > goodYears && badYears > neutralYears) {
      return `整体来看，${geJu}在未来${trend.length}年中发展趋势不佳，需要注意调整和应对。`;
    } else {
      return `整体来看，${geJu}在未来${trend.length}年中发展趋势起伏不定，需要根据具体年份灵活调整。`;
    }
  }

  /**
   * 提供建议
   * @param trend 趋势数据
   * @param keyYears 关键年份
   * @param geJu 格局名称
   * @returns 建议
   */
  private static provideSuggestion(
    trend: TrendPoint[],
    keyYears: { year: number; event: string; level: 'good' | 'bad' | 'neutral' | 'mixed' }[],
    geJu: string
  ): string {
    if (trend.length === 0 || keyYears.length === 0) {
      return '无法提供建议，数据不足。';
    }

    const goodYears = trend.filter(point => point.level === 'good').length;
    const badYears = trend.filter(point => point.level === 'bad').length;
    const goodKeyYears = keyYears
      .filter(year => year.level === 'good')
      .map(year => year.year)
      .join('年、');
    const badKeyYears = keyYears
      .filter(year => year.level === 'bad')
      .map(year => year.year)
      .join('年、');

    let suggestion = '';

    if (goodYears > badYears) {
      suggestion = `对于${geJu}，建议在有利时期积极发展事业，在不利时期注意调整和保守。`;
      if (goodKeyYears) {
        suggestion += `特别是在${goodKeyYears}年等关键年份，可以有所作为。`;
      }
      if (badKeyYears) {
        suggestion += `而在${badKeyYears}年等年份，需要特别谨慎。`;
      }
    } else if (badYears > goodYears) {
      suggestion = `对于${geJu}，建议在不利时期保守行事，注意调整心态和方向。`;
      if (badKeyYears) {
        suggestion += `特别是在${badKeyYears}年等关键年份，需要特别谨慎。`;
      }
      if (goodKeyYears) {
        suggestion += `而在${goodKeyYears}年等年份，可以适度进取。`;
      }
    } else {
      suggestion = `对于${geJu}，建议根据具体年份灵活调整策略，在有利时期积极进取，在不利时期保守行事。`;
      if (goodKeyYears && badKeyYears) {
        suggestion += `特别注意${goodKeyYears}年等有利年份和${badKeyYears}年等不利年份的变化。`;
      }
    }

    return suggestion;
  }
}
