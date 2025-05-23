/**
 * 格局趋势分析服务
 * 提供格局随大运、流年变化的趋势分析
 */
import { GeJuService } from './GeJuService';
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
    static generateTrendData(geJu, riZhuWuXing, birthYear, daYunList, years = 20) {
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
        const trend = [];
        for (let year = startYear; year <= endYear; year++) {
            // 找到当前年份所在的大运
            const currentDaYun = daYunList.find(daYun => year >= daYun.startYear && year <= daYun.endYear);
            if (!currentDaYun) {
                continue;
            }
            // 计算当前年份在大运中的位置（0-1之间）
            const daYunProgress = (year - currentDaYun.startYear) /
                (currentDaYun.endYear - currentDaYun.startYear);
            // 获取大运效应强度
            const daYunEffect = daYunEffects.find(effect => effect.ganZhi === currentDaYun.ganZhi);
            let strength = 0;
            let level = 'neutral';
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
                }
                else if (strength < -0.5) {
                    level = 'bad';
                }
                else if (strength >= -0.2 && strength <= 0.2) {
                    level = 'neutral';
                }
                else {
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
    static getDaYunEffects(geJu, riZhuWuXing, daYunList, startYear, endYear) {
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
    static getKeyYears(geJu, riZhuWuXing, daYunList, startYear, endYear) {
        const keyYears = [];
        // 添加大运交接年
        daYunList.forEach((daYun, index) => {
            if (daYun.startYear >= startYear && daYun.startYear <= endYear) {
                const effect = GeJuService.analyzeDaYunEffect(geJu, daYun.ganZhi, riZhuWuXing);
                let event = '';
                if (index === 0) {
                    event = `进入${daYun.ganZhi}大运，${effect.effect}`;
                }
                else {
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
            const currentDaYun = daYunList.find(daYun => year >= daYun.startYear && year <= daYun.endYear);
            if (!currentDaYun) {
                continue;
            }
            // 模拟一些重要流年（例如，每5年一个重要节点）
            if ((year - startYear) % 5 === 0 && !keyYears.some(key => key.year === year)) {
                const daYunEffect = GeJuService.analyzeDaYunEffect(geJu, currentDaYun.ganZhi, riZhuWuXing);
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
    static analyzeTrend(trend, geJu) {
        if (trend.length === 0) {
            return '无法分析格局趋势，数据不足。';
        }
        const goodYears = trend.filter(point => point.level === 'good').length;
        const badYears = trend.filter(point => point.level === 'bad').length;
        const neutralYears = trend.filter(point => point.level === 'neutral' || point.level === 'mixed').length;
        if (goodYears > badYears && goodYears > neutralYears) {
            return `整体来看，${geJu}在未来${trend.length}年中发展趋势良好，有利于事业发展和个人成长。`;
        }
        else if (badYears > goodYears && badYears > neutralYears) {
            return `整体来看，${geJu}在未来${trend.length}年中发展趋势不佳，需要注意调整和应对。`;
        }
        else {
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
    static provideSuggestion(trend, keyYears, geJu) {
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
        }
        else if (badYears > goodYears) {
            suggestion = `对于${geJu}，建议在不利时期保守行事，注意调整心态和方向。`;
            if (badKeyYears) {
                suggestion += `特别是在${badKeyYears}年等关键年份，需要特别谨慎。`;
            }
            if (goodKeyYears) {
                suggestion += `而在${goodKeyYears}年等年份，可以适度进取。`;
            }
        }
        else {
            suggestion = `对于${geJu}，建议根据具体年份灵活调整策略，在有利时期积极进取，在不利时期保守行事。`;
            if (goodKeyYears && badKeyYears) {
                suggestion += `特别注意${goodKeyYears}年等有利年份和${badKeyYears}年等不利年份的变化。`;
            }
        }
        return suggestion;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VKdVRyZW5kU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdlSnVUcmVuZFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQW9CNUMsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQjs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FDN0IsSUFBWSxFQUNaLFdBQW1CLEVBQ25CLFNBQWlCLEVBQ2pCLFNBQW1FLEVBQ25FLFFBQWdCLEVBQUU7UUFFbEIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNqRSxPQUFPO2dCQUNMLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLFVBQVUsRUFBRSxxQkFBcUI7YUFDbEMsQ0FBQztTQUNIO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUM7UUFDOUIsTUFBTSxPQUFPLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUVwQyxTQUFTO1FBQ1QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFNUYsUUFBUTtRQUNSLE1BQU0sS0FBSyxHQUFpQixFQUFFLENBQUM7UUFDL0IsS0FBSyxJQUFJLElBQUksR0FBRyxTQUFTLEVBQUUsSUFBSSxJQUFJLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNsRCxjQUFjO1lBQ2QsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FDakMsS0FBSyxD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QUFFLENBQUM7UUFFcEIsSUFBSSxTQUFTLEdBQUcsUUFBUSxFQUFFO1lBQ3hCLFVBQVUsR0FBRyxLQUFLLElBQUksOEJBQThCLENBQUM7WUFDckQsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLFVBQVUsSUFBSSxPQUFPLFlBQVksZ0JBQWdCLENBQUM7YUFDbkQ7WUFDRCxJQUFJLFdBQVcsRUFBRTtnQkFDZixVQUFVLElBQUksS0FBSyxXQUFXLGNBQWMsQ0FBQzthQUM5QztTQUNGO2FBQU0sSUFBSSxRQUFRLEdBQUcsU0FBUyxFQUFFO1lBQy9CLFVBQVUsR0FBRyxLQUFLLElBQUkseUJBQXlCLENBQUM7WUFDaEQsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsVUFBVSxJQUFJLE9BQU8sV0FBVyxnQkFBZ0IsQ0FBQzthQUNsRDtZQUNELElBQUksWUFBWSxFQUFFO2dCQUNoQixVQUFVLElBQUksS0FBSyxZQUFZLGNBQWMsQ0FBQzthQUMvQztTQUNGO2FBQU07WUFDTCxVQUFVLEdBQUcsS0FBSyxJQUFJLHNDQUFzQyxDQUFDO1lBQzdELElBQUksWUFBWSxJQUFJLFdBQVcsRUFBRTtnQkFDL0IsVUFBVSxJQUFJLE9BQU8sWUFBWSxVQUFVLFdBQVcsWUFBWSxDQUFDO2FBQ3BFO1NBQ0Y7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOagvOWxgOi2i+WKv+WIhuaekOacjeWKoVxuICog5o+Q5L6b5qC85bGA6ZqP5aSn6L+Q44CB5rWB5bm05Y+Y5YyW55qE6LaL5Yq/5YiG5p6QXG4gKi9cbmltcG9ydCB7IEdlSnVTZXJ2aWNlIH0gZnJvbSAnLi9HZUp1U2VydmljZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJlbmRQb2ludCB7XG4gIHllYXI6IG51bWJlcjtcbiAgc3RyZW5ndGg6IG51bWJlcjtcbiAgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJztcbiAgZXZlbnQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2VKdVRyZW5kRGF0YSB7XG4gIHRyZW5kOiBUcmVuZFBvaW50W107XG4gIGtleVllYXJzOiB7XG4gICAgeWVhcjogbnVtYmVyO1xuICAgIGV2ZW50OiBzdHJpbmc7XG4gICAgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJztcbiAgfVtdO1xuICBhbmFseXNpczogc3RyaW5nO1xuICBzdWdnZXN0aW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBHZUp1VHJlbmRTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIOeUn+aIkOagvOWxgOi2i+WKv+aVsOaNrlxuICAgKiBAcGFyYW0gZ2VKdSDmoLzlsYDlkI3np7BcbiAgICogQHBhcmFtIHJpWmh1V3VYaW5nIOaXpeS4u+S6lOihjFxuICAgKiBAcGFyYW0gYmlydGhZZWFyIOWHuueUn+W5tOS7vVxuICAgKiBAcGFyYW0gZGFZdW5MaXN0IOWkp+i/kOWIl+ihqFxuICAgKiBAcGFyYW0geWVhcnMg5YiG5p6Q5bm05pWw77yI6buY6K6kMjDlubTvvIlcbiAgICogQHJldHVybnMg5qC85bGA6LaL5Yq/5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdlbmVyYXRlVHJlbmREYXRhKFxuICAgIGdlSnU6IHN0cmluZyxcbiAgICByaVpodVd1WGluZzogc3RyaW5nLFxuICAgIGJpcnRoWWVhcjogbnVtYmVyLFxuICAgIGRhWXVuTGlzdDogeyBnYW5aaGk6IHN0cmluZzsgc3RhcnRZZWFyOiBudW1iZXI7IGVuZFllYXI6IG51bWJlciB9W10sXG4gICAgeWVhcnM6IG51bWJlciA9IDIwXG4gICk6IEdlSnVUcmVuZERhdGEge1xuICAgIGlmICghZ2VKdSB8fCAhcmlaaHVXdVhpbmcgfHwgIWRhWXVuTGlzdCB8fCBkYVl1bkxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0cmVuZDogW10sXG4gICAgICAgIGtleVllYXJzOiBbXSxcbiAgICAgICAgYW5hbHlzaXM6ICfml6Dms5XliIbmnpDmoLzlsYDotovlir/vvIzkv6Hmga/kuI3otrPjgIInLFxuICAgICAgICBzdWdnZXN0aW9uOiAn6K+35o+Q5L6b5a6M5pW055qE5qC85bGA44CB5pel5Li75LqU6KGM5ZKM5aSn6L+Q5L+h5oGv44CCJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50WWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTtcbiAgICBjb25zdCBzdGFydFllYXIgPSBjdXJyZW50WWVhcjtcbiAgICBjb25zdCBlbmRZZWFyID0gY3VycmVudFllYXIgKyB5ZWFycztcblxuICAgIC8vIOiOt+WPluWkp+i/kOW9seWTjVxuICAgIGNvbnN0IGRhWXVuRWZmZWN0cyA9IHRoaXMuZ2V0RGFZdW5FZmZlY3RzKGdlSnUsIHJpWmh1V3VYaW5nLCBkYVl1bkxpc3QsIHN0YXJ0WWVhciwgZW5kWWVhcik7XG5cbiAgICAvLyDnlJ/miJDotovlir/ngrlcbiAgICBjb25zdCB0cmVuZDogVHJlbmRQb2ludFtdID0gW107XG4gICAgZm9yIChsZXQgeWVhciA9IHN0YXJ0WWVhcjsgeWVhciA8PSBlbmRZZWFyOyB5ZWFyKyspIHtcbiAgICAgIC8vIOaJvuWIsOW9k+WJjeW5tOS7veaJgOWcqOeahOWkp+i/kFxuICAgICAgY29uc3QgY3VycmVudERhWXVuID0gZGFZdW5MaXN0LmZpbmQoXG4gICAgICAgIGRhWXVuID0+IHllYXIgPj0gZGFZdW4uc3RhcnRZZWFyICYmIHllYXIgPD0gZGFZdW4uZW5kWWVhclxuICAgICAgKTtcblxuICAgICAgaWYgKCFjdXJyZW50RGFZdW4pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIOiuoeeul+W9k+WJjeW5tOS7veWcqOWkp+i/kOS4reeahOS9jee9ru+8iDAtMeS5i+mXtO+8iVxuICAgICAgY29uc3QgZGFZdW5Qcm9ncmVzcyA9XG4gICAgICAgICh5ZWFyIC0gY3VycmVudERhWXVuLnN0YXJ0WWVhcikgL1xuICAgICAgICAoY3VycmVudERhWXVuLmVuZFllYXIgLSBjdXJyZW50RGFZdW4uc3RhcnRZZWFyKTtcblxuICAgICAgLy8g6I635Y+W5aSn6L+Q5pWI5bqU5by65bqmXG4gICAgICBjb25zdCBkYVl1bkVmZmVjdCA9IGRhWXVuRWZmZWN0cy5maW5kKGVmZmVjdCA9PiBlZmZlY3QuZ2FuWmhpID09PSBjdXJyZW50RGFZdW4uZ2FuWmhpKTtcbiAgICAgIGxldCBzdHJlbmd0aCA9IDA7XG4gICAgICBsZXQgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJyA9ICduZXV0cmFsJztcblxuICAgICAgaWYgKGRhWXVuRWZmZWN0KSB7XG4gICAgICAgIC8vIOagueaNruWkp+i/kOaViOW6lOe6p+WIq+iuvue9ruWfuuehgOW8uuW6plxuICAgICAgICBzd2l0Y2ggKGRhWXVuRWZmZWN0LmxldmVsKSB7XG4gICAgICAgICAgY2FzZSAnZ29vZCc6XG4gICAgICAgICAgICBzdHJlbmd0aCA9IDAuNztcbiAgICAgICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYmFkJzpcbiAgICAgICAgICAgIHN0cmVuZ3RoID0gLTAuNztcbiAgICAgICAgICAgIGxldmVsID0gJ2JhZCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdtaXhlZCc6XG4gICAgICAgICAgICBzdHJlbmd0aCA9IDAuMjtcbiAgICAgICAgICAgIGxldmVsID0gJ21peGVkJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBzdHJlbmd0aCA9IDA7XG4gICAgICAgICAgICBsZXZlbCA9ICduZXV0cmFsJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOagueaNruWkp+i/kOi/m+Wxleiwg+aVtOW8uuW6pu+8iOWkp+i/kOWIneacn+W9seWTjei+g+Wwj++8jOS4reacn+acgOW8uu+8jOWQjuacn+WHj+W8se+8iVxuICAgICAgICBjb25zdCBwcm9ncmVzc0ZhY3RvciA9IDEgLSBNYXRoLmFicyhkYVl1blByb2dyZXNzIC0gMC41KSAqIDAuNTtcbiAgICAgICAgc3RyZW5ndGggKj0gcHJvZ3Jlc3NGYWN0b3I7XG5cbiAgICAgICAgLy8g5re75Yqg5rWB5bm05b2x5ZON77yI566A5YyW5qih5ouf77yM5a6e6ZmF5bqU6K+l5qC55o2u5YW35L2T5rWB5bm05bmy5pSv6K6h566X77yJXG4gICAgICAgIGNvbnN0IHllYXJWYXJpYXRpb24gPSBNYXRoLnNpbih5ZWFyICogMC41KSAqIDAuMzsgLy8g566A5Y2V55qE5ZGo5pyf5oCn5Y+Y5YyWXG4gICAgICAgIHN0cmVuZ3RoICs9IHllYXJWYXJpYXRpb247XG5cbiAgICAgICAgLy8g6ZmQ5Yi25by65bqm6IyD5Zu05ZyoLTHliLAx5LmL6Ze0XG4gICAgICAgIHN0cmVuZ3RoID0gTWF0aC5tYXgoLTEsIE1hdGgubWluKDEsIHN0cmVuZ3RoKSk7XG5cbiAgICAgICAgLy8g5qC55o2u5by65bqm6LCD5pW057qn5YirXG4gICAgICAgIGlmIChzdHJlbmd0aCA+IDAuNSkge1xuICAgICAgICAgIGxldmVsID0gJ2dvb2QnO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVuZ3RoIDwgLTAuNSkge1xuICAgICAgICAgIGxldmVsID0gJ2JhZCc7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZW5ndGggPj0gLTAuMiAmJiBzdHJlbmd0aCA8PSAwLjIpIHtcbiAgICAgICAgICBsZXZlbCA9ICduZXV0cmFsJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXZlbCA9ICdtaXhlZCc7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8g5re75Yqg6LaL5Yq/54K5XG4gICAgICB0cmVuZC5wdXNoKHtcbiAgICAgICAgeWVhcixcbiAgICAgICAgc3RyZW5ndGgsXG4gICAgICAgIGxldmVsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmib7lh7rlhbPplK7lubTku71cbiAgICBjb25zdCBrZXlZZWFycyA9IHRoaXMuZ2V0S2V5WWVhcnMoZ2VKdSwgcmlaaHVXdVhpbmcsIGRhWXVuTGlzdCwgc3RhcnRZZWFyLCBlbmRZZWFyKTtcblxuICAgIC8vIOWIhuaekOaVtOS9k+i2i+WKv1xuICAgIGNvbnN0IGFuYWx5c2lzID0gdGhpcy5hbmFseXplVHJlbmQodHJlbmQsIGdlSnUpO1xuXG4gICAgLy8g5o+Q5L6b5bu66K6uXG4gICAgY29uc3Qgc3VnZ2VzdGlvbiA9IHRoaXMucHJvdmlkZVN1Z2dlc3Rpb24odHJlbmQsIGtleVllYXJzLCBnZUp1KTtcblxuICAgIHJldHVybiB7XG4gICAgICB0cmVuZCxcbiAgICAgIGtleVllYXJzLFxuICAgICAgYW5hbHlzaXMsXG4gICAgICBzdWdnZXN0aW9uXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blpKfov5DlvbHlk41cbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqIEBwYXJhbSByaVpodVd1WGluZyDml6XkuLvkupTooYxcbiAgICogQHBhcmFtIGRhWXVuTGlzdCDlpKfov5DliJfooahcbiAgICogQHBhcmFtIHN0YXJ0WWVhciDlvIDlp4vlubTku71cbiAgICogQHBhcmFtIGVuZFllYXIg57uT5p2f5bm05Lu9XG4gICAqIEByZXR1cm5zIOWkp+i/kOW9seWTjeWIl+ihqFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0RGFZdW5FZmZlY3RzKFxuICAgIGdlSnU6IHN0cmluZyxcbiAgICByaVpodVd1WGluZzogc3RyaW5nLFxuICAgIGRhWXVuTGlzdDogeyBnYW5aaGk6IHN0cmluZzsgc3RhcnRZZWFyOiBudW1iZXI7IGVuZFllYXI6IG51bWJlciB9W10sXG4gICAgc3RhcnRZZWFyOiBudW1iZXIsXG4gICAgZW5kWWVhcjogbnVtYmVyXG4gICk6IHtcbiAgICBnYW5aaGk6IHN0cmluZztcbiAgICBlZmZlY3Q6IHN0cmluZztcbiAgICBsZXZlbDogJ2dvb2QnIHwgJ2JhZCcgfCAnbmV1dHJhbCcgfCAnbWl4ZWQnO1xuICB9W10ge1xuICAgIHJldHVybiBkYVl1bkxpc3RcbiAgICAgIC5maWx0ZXIoZGFZdW4gPT4gZGFZdW4uZW5kWWVhciA+PSBzdGFydFllYXIgJiYgZGFZdW4uc3RhcnRZZWFyIDw9IGVuZFllYXIpXG4gICAgICAubWFwKGRhWXVuID0+IHtcbiAgICAgICAgY29uc3QgZWZmZWN0ID0gR2VKdVNlcnZpY2UuYW5hbHl6ZURhWXVuRWZmZWN0KGdlSnUsIGRhWXVuLmdhblpoaSwgcmlaaHVXdVhpbmcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdhblpoaTogZGFZdW4uZ2FuWmhpLFxuICAgICAgICAgIGVmZmVjdDogZWZmZWN0LmVmZmVjdCxcbiAgICAgICAgICBsZXZlbDogZWZmZWN0LmxldmVsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blhbPplK7lubTku71cbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqIEBwYXJhbSByaVpodVd1WGluZyDml6XkuLvkupTooYxcbiAgICogQHBhcmFtIGRhWXVuTGlzdCDlpKfov5DliJfooahcbiAgICogQHBhcmFtIHN0YXJ0WWVhciDlvIDlp4vlubTku71cbiAgICogQHBhcmFtIGVuZFllYXIg57uT5p2f5bm05Lu9XG4gICAqIEByZXR1cm5zIOWFs+mUruW5tOS7veWIl+ihqFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0S2V5WWVhcnMoXG4gICAgZ2VKdTogc3RyaW5nLFxuICAgIHJpWmh1V3VYaW5nOiBzdHJpbmcsXG4gICAgZGFZdW5MaXN0OiB7IGdhblpoaTogc3RyaW5nOyBzdGFydFllYXI6IG51bWJlcjsgZW5kWWVhcjogbnVtYmVyIH1bXSxcbiAgICBzdGFydFllYXI6IG51bWJlcixcbiAgICBlbmRZZWFyOiBudW1iZXJcbiAgKToge1xuICAgIHllYXI6IG51bWJlcjtcbiAgICBldmVudDogc3RyaW5nO1xuICAgIGxldmVsOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCc7XG4gIH1bXSB7XG4gICAgY29uc3Qga2V5WWVhcnM6IHtcbiAgICAgIHllYXI6IG51bWJlcjtcbiAgICAgIGV2ZW50OiBzdHJpbmc7XG4gICAgICBsZXZlbDogJ2dvb2QnIHwgJ2JhZCcgfCAnbmV1dHJhbCcgfCAnbWl4ZWQnO1xuICAgIH1bXSA9IFtdO1xuXG4gICAgLy8g5re75Yqg5aSn6L+Q5Lqk5o6l5bm0XG4gICAgZGFZdW5MaXN0LmZvckVhY2goKGRhWXVuLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGRhWXVuLnN0YXJ0WWVhciA+PSBzdGFydFllYXIgJiYgZGFZdW4uc3RhcnRZZWFyIDw9IGVuZFllYXIpIHtcbiAgICAgICAgY29uc3QgZWZmZWN0ID0gR2VKdVNlcnZpY2UuYW5hbHl6ZURhWXVuRWZmZWN0KGdlSnUsIGRhWXVuLmdhblpoaSwgcmlaaHVXdVhpbmcpO1xuICAgICAgICBsZXQgZXZlbnQgPSAnJztcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgZXZlbnQgPSBg6L+b5YWlJHtkYVl1bi5nYW5aaGl95aSn6L+Q77yMJHtlZmZlY3QuZWZmZWN0fWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXZlbnQgPSBg5LuOJHtkYVl1bkxpc3RbaW5kZXggLSAxXS5nYW5aaGl95aSn6L+Q6L+b5YWlJHtkYVl1bi5nYW5aaGl95aSn6L+Q77yMJHtlZmZlY3QuZWZmZWN0fWA7XG4gICAgICAgIH1cbiAgICAgICAga2V5WWVhcnMucHVzaCh7XG4gICAgICAgICAgeWVhcjogZGFZdW4uc3RhcnRZZWFyLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIGxldmVsOiBlZmZlY3QubGV2ZWxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDmt7vliqDkuIDkupvph43opoHmtYHlubTvvIjnroDljJbmqKHmi5/vvIzlrp7pmYXlupTor6XmoLnmja7lhbfkvZPmtYHlubTlubLmlK/orqHnrpfvvIlcbiAgICBmb3IgKGxldCB5ZWFyID0gc3RhcnRZZWFyOyB5ZWFyIDw9IGVuZFllYXI7IHllYXIrKykge1xuICAgICAgLy8g5om+5Yiw5b2T5YmN5bm05Lu95omA5Zyo55qE5aSn6L+QXG4gICAgICBjb25zdCBjdXJyZW50RGFZdW4gPSBkYVl1bkxpc3QuZmluZChcbiAgICAgICAgZGFZdW4gPT4geWVhciA+PSBkYVl1bi5zdGFydFllYXIgJiYgeWVhciA8PSBkYVl1bi5lbmRZZWFyXG4gICAgICApO1xuXG4gICAgICBpZiAoIWN1cnJlbnREYVl1bikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8g5qih5ouf5LiA5Lqb6YeN6KaB5rWB5bm077yI5L6L5aaC77yM5q+PNeW5tOS4gOS4qumHjeimgeiKgueCue+8iVxuICAgICAgaWYgKCh5ZWFyIC0gc3RhcnRZZWFyKSAlIDUgPT09IDAgJiYgIWtleVllYXJzLnNvbWUoa2V5ID0+IGtleS55ZWFyID09PSB5ZWFyKSkge1xuICAgICAgICBjb25zdCBkYVl1bkVmZmVjdCA9IEdlSnVTZXJ2aWNlLmFuYWx5emVEYVl1bkVmZmVjdChcbiAgICAgICAgICBnZUp1LFxuICAgICAgICAgIGN1cnJlbnREYVl1bi5nYW5aaGksXG4gICAgICAgICAgcmlaaHVXdVhpbmdcbiAgICAgICAgKTtcbiAgICAgICAga2V5WWVhcnMucHVzaCh7XG4gICAgICAgICAgeWVhcixcbiAgICAgICAgICBldmVudDogYCR7eWVhcn3lubTmtYHlubTvvIwke2RhWXVuRWZmZWN0LmVmZmVjdH1gLFxuICAgICAgICAgIGxldmVsOiBkYVl1bkVmZmVjdC5sZXZlbFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ga2V5WWVhcnMuc29ydCgoYSwgYikgPT4gYS55ZWFyIC0gYi55ZWFyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliIbmnpDotovlir9cbiAgICogQHBhcmFtIHRyZW5kIOi2i+WKv+aVsOaNrlxuICAgKiBAcGFyYW0gZ2VKdSDmoLzlsYDlkI3np7BcbiAgICogQHJldHVybnMg6LaL5Yq/5YiG5p6QXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhbmFseXplVHJlbmQodHJlbmQ6IFRyZW5kUG9pbnRbXSwgZ2VKdTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodHJlbmQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gJ+aXoOazleWIhuaekOagvOWxgOi2i+WKv++8jOaVsOaNruS4jei2s+OAgic7XG4gICAgfVxuXG4gICAgY29uc3QgZ29vZFllYXJzID0gdHJlbmQuZmlsdGVyKHBvaW50ID0+IHBvaW50LmxldmVsID09PSAnZ29vZCcpLmxlbmd0aDtcbiAgICBjb25zdCBiYWRZZWFycyA9IHRyZW5kLmZpbHRlcihwb2ludCA9PiBwb2ludC5sZXZlbCA9PT0gJ2JhZCcpLmxlbmd0aDtcbiAgICBjb25zdCBuZXV0cmFsWWVhcnMgPSB0cmVuZC5maWx0ZXIoXG4gICAgICBwb2ludCA9PiBwb2ludC5sZXZlbCA9PT0gJ25ldXRyYWwnIHx8IHBvaW50LmxldmVsID09PSAnbWl4ZWQnXG4gICAgKS5sZW5ndGg7XG5cbiAgICBpZiAoZ29vZFllYXJzID4gYmFkWWVhcnMgJiYgZ29vZFllYXJzID4gbmV1dHJhbFllYXJzKSB7XG4gICAgICByZXR1cm4gYOaVtOS9k+adpeeci++8jCR7Z2VKdX3lnKjmnKrmnaUke3RyZW5kLmxlbmd0aH3lubTkuK3lj5HlsZXotovlir/oia/lpb3vvIzmnInliKnkuo7kuovkuJrlj5HlsZXlkozkuKrkurrmiJDplb/jgIJgO1xuICAgIH0gZWxzZSBpZiAoYmFkWWVhcnMgPiBnb29kWWVhcnMgJiYgYmFkWWVhcnMgPiBuZXV0cmFsWWVhcnMpIHtcbiAgICAgIHJldHVybiBg5pW05L2T5p2l55yL77yMJHtnZUp1feWcqOacquadpSR7dHJlbmQubGVuZ3RofeW5tOS4reWPkeWxlei2i+WKv+S4jeS9s++8jOmcgOimgeazqOaEj+iwg+aVtOWSjOW6lOWvueOAgmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBg5pW05L2T5p2l55yL77yMJHtnZUp1feWcqOacquadpSR7dHJlbmQubGVuZ3RofeW5tOS4reWPkeWxlei2i+WKv+i1t+S8j+S4jeWumu+8jOmcgOimgeagueaNruWFt+S9k+W5tOS7veeBtea0u+iwg+aVtOOAgmA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOaPkOS+m+W7uuiurlxuICAgKiBAcGFyYW0gdHJlbmQg6LaL5Yq/5pWw5o2uXG4gICAqIEBwYXJhbSBrZXlZZWFycyDlhbPplK7lubTku71cbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqIEByZXR1cm5zIOW7uuiurlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcHJvdmlkZVN1Z2dlc3Rpb24oXG4gICAgdHJlbmQ6IFRyZW5kUG9pbnRbXSxcbiAgICBrZXlZZWFyczogeyB5ZWFyOiBudW1iZXI7IGV2ZW50OiBzdHJpbmc7IGxldmVsOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCcgfVtdLFxuICAgIGdlSnU6IHN0cmluZ1xuICApOiBzdHJpbmcge1xuICAgIGlmICh0cmVuZC5sZW5ndGggPT09IDAgfHwga2V5WWVhcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gJ+aXoOazleaPkOS+m+W7uuiuru+8jOaVsOaNruS4jei2s+OAgic7XG4gICAgfVxuXG4gICAgY29uc3QgZ29vZFllYXJzID0gdHJlbmQuZmlsdGVyKHBvaW50ID0+IHBvaW50LmxldmVsID09PSAnZ29vZCcpLmxlbmd0aDtcbiAgICBjb25zdCBiYWRZZWFycyA9IHRyZW5kLmZpbHRlcihwb2ludCA9PiBwb2ludC5sZXZlbCA9PT0gJ2JhZCcpLmxlbmd0aDtcbiAgICBjb25zdCBnb29kS2V5WWVhcnMgPSBrZXlZZWFyc1xuICAgICAgLmZpbHRlcih5ZWFyID0+IHllYXIubGV2ZWwgPT09ICdnb29kJylcbiAgICAgIC5tYXAoeWVhciA9PiB5ZWFyLnllYXIpXG4gICAgICAuam9pbign5bm044CBJyk7XG4gICAgY29uc3QgYmFkS2V5WWVhcnMgPSBrZXlZZWFyc1xuICAgICAgLmZpbHRlcih5ZWFyID0+IHllYXIubGV2ZWwgPT09ICdiYWQnKVxuICAgICAgLm1hcCh5ZWFyID0+IHllYXIueWVhcilcbiAgICAgIC5qb2luKCflubTjgIEnKTtcblxuICAgIGxldCBzdWdnZXN0aW9uID0gJyc7XG5cbiAgICBpZiAoZ29vZFllYXJzID4gYmFkWWVhcnMpIHtcbiAgICAgIHN1Z2dlc3Rpb24gPSBg5a+55LqOJHtnZUp1fe+8jOW7uuiuruWcqOacieWIqeaXtuacn+enr+aegeWPkeWxleS6i+S4mu+8jOWcqOS4jeWIqeaXtuacn+azqOaEj+iwg+aVtOWSjOS/neWuiOOAgmA7XG4gICAgICBpZiAoZ29vZEtleVllYXJzKSB7XG4gICAgICAgIHN1Z2dlc3Rpb24gKz0gYOeJueWIq+aYr+WcqCR7Z29vZEtleVllYXJzfeW5tOetieWFs+mUruW5tOS7ve+8jOWPr+S7peacieaJgOS9nOS4uuOAgmA7XG4gICAgICB9XG4gICAgICBpZiAoYmFkS2V5WWVhcnMpIHtcbiAgICAgICAgc3VnZ2VzdGlvbiArPSBg6ICM5ZyoJHtiYWRLZXlZZWFyc33lubTnrYnlubTku73vvIzpnIDopoHnibnliKvosKjmhY7jgIJgO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYmFkWWVhcnMgPiBnb29kWWVhcnMpIHtcbiAgICAgIHN1Z2dlc3Rpb24gPSBg5a+55LqOJHtnZUp1fe+8jOW7uuiuruWcqOS4jeWIqeaXtuacn+S/neWuiOihjOS6i++8jOazqOaEj+iwg+aVtOW/g+aAgeWSjOaWueWQkeOAgmA7XG4gICAgICBpZiAoYmFkS2V5WWVhcnMpIHtcbiAgICAgICAgc3VnZ2VzdGlvbiArPSBg54m55Yir5piv5ZyoJHtiYWRLZXlZZWFyc33lubTnrYnlhbPplK7lubTku73vvIzpnIDopoHnibnliKvosKjmhY7jgIJgO1xuICAgICAgfVxuICAgICAgaWYgKGdvb2RLZXlZZWFycykge1xuICAgICAgICBzdWdnZXN0aW9uICs9IGDogIzlnKgke2dvb2RLZXlZZWFyc33lubTnrYnlubTku73vvIzlj6/ku6XpgILluqbov5vlj5bjgIJgO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdWdnZXN0aW9uID0gYOWvueS6jiR7Z2VKdX3vvIzlu7rorq7moLnmja7lhbfkvZPlubTku73ngbXmtLvosIPmlbTnrZbnlaXvvIzlnKjmnInliKnml7bmnJ/np6/mnoHov5vlj5bvvIzlnKjkuI3liKnml7bmnJ/kv53lrojooYzkuovjgIJgO1xuICAgICAgaWYgKGdvb2RLZXlZZWFycyAmJiBiYWRLZXlZZWFycykge1xuICAgICAgICBzdWdnZXN0aW9uICs9IGDnibnliKvms6jmhI8ke2dvb2RLZXlZZWFyc33lubTnrYnmnInliKnlubTku73lkowke2JhZEtleVllYXJzfeW5tOetieS4jeWIqeW5tOS7veeahOWPmOWMluOAgmA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1Z2dlc3Rpb247XG4gIH1cbn1cbiJdfQ==