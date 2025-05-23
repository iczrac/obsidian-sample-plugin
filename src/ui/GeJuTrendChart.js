export class GeJuTrendChart {
    /**
     * 构造函数
     * @param container 容器元素
     * @param trendData 趋势数据
     * @param keyYears 关键年份
     * @param width 图表宽度
     * @param height 图表高度
     */
    constructor(container, trendData, keyYears, width = 800, height = 400) {
        this.container = container;
        this.trendData = trendData;
        this.keyYears = keyYears;
        this.width = width;
        this.height = height;
        this.padding = { top: 40, right: 40, bottom: 60, left: 60 };
        this.chartWidth = this.width - this.padding.left - this.padding.right;
        this.chartHeight = this.height - this.padding.top - this.padding.bottom;
    }
    /**
     * 渲染图表
     */
    render() {
        if (!this.trendData || this.trendData.length === 0) {
            this.renderError('无法渲染图表，数据不足。');
            return;
        }
        // 清空容器
        this.container.innerHTML = '';
        // 创建SVG元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.width.toString());
        svg.setAttribute('height', this.height.toString());
        svg.setAttribute('class', 'geju-trend-chart');
        this.container.appendChild(svg);
        // 创建图表组
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${this.padding.left}, ${this.padding.top})`);
        svg.appendChild(chartGroup);
        // 绘制坐标轴
        this.drawAxes(chartGroup);
        // 绘制趋势线
        this.drawTrendLine(chartGroup);
        // 绘制关键年份标记
        this.drawKeyYears(chartGroup);
        // 绘制图例
        this.drawLegend(svg);
    }
    /**
     * 绘制坐标轴
     * @param group SVG组元素
     */
    drawAxes(group) {
        // 获取年份范围
        const years = this.trendData.map(point => point.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        // 创建X轴
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', '0');
        xAxis.setAttribute('y1', (this.chartHeight / 2).toString());
        xAxis.setAttribute('x2', this.chartWidth.toString());
        xAxis.setAttribute('y2', (this.chartHeight / 2).toString());
        xAxis.setAttribute('stroke', '#999');
        xAxis.setAttribute('stroke-width', '1');
        group.appendChild(xAxis);
        // 创建Y轴
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', '0');
        yAxis.setAttribute('y1', '0');
        yAxis.setAttribute('x2', '0');
        yAxis.setAttribute('y2', this.chartHeight.toString());
        yAxis.setAttribute('stroke', '#999');
        yAxis.setAttribute('stroke-width', '1');
        group.appendChild(yAxis);
        // 绘制X轴刻度
        const yearStep = Math.ceil((maxYear - minYear) / 10); // 最多显示10个刻度
        for (let year = minYear; year <= maxYear; year += yearStep) {
            const x = this.getXPosition(year, minYear, maxYear);
            // 绘制刻度线
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x.toString());
            tick.setAttribute('y1', (this.chartHeight / 2 - 5).toString());
            tick.setAttribute('x2', x.toString());
            tick.setAttribute('y2', (this.chartHeight / 2 + 5).toString());
            tick.setAttribute('stroke', '#999');
            tick.setAttribute('stroke-width', '1');
            group.appendChild(tick);
            // 绘制刻度文本
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x.toString());
            text.setAttribute('y', (this.chartHeight / 2 + 20).toString());
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '12');
            text.textContent = year.toString();
            group.appendChild(text);
        }
        // 绘制Y轴刻度
        const strengthLevels = [-1, -0.5, 0, 0.5, 1];
        const strengthLabels = ['极弱', '弱', '平衡', '强', '极强'];
        for (let i = 0; i < strengthLevels.length; i++) {
            const strength = strengthLevels[i];
            const y = this.getYPosition(strength);
            // 绘制刻度线
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', '-5');
            tick.setAttribute('y1', y.toString());
            tick.setAttribute('x2', '5');
            tick.setAttribute('y2', y.toString());
            tick.setAttribute('stroke', '#999');
            tick.setAttribute('stroke-width', '1');
            group.appendChild(tick);
            // 绘制刻度文本
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '-10');
            text.setAttribute('y', (y + 5).toString());
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('font-size', '12');
            text.textContent = strengthLabels[i];
            group.appendChild(text);
            // 绘制水平参考线
            if (strength !== 0) {
                const referenceLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                referenceLine.setAttribute('x1', '0');
                referenceLine.setAttribute('y1', y.toString());
                referenceLine.setAttribute('x2', this.chartWidth.toString());
                referenceLine.setAttribute('y2', y.toString());
                referenceLine.setAttribute('stroke', '#ddd');
                referenceLine.setAttribute('stroke-width', '1');
                referenceLine.setAttribute('stroke-dasharray', '5,5');
                group.appendChild(referenceLine);
            }
        }
        // 添加坐标轴标题
        const xTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xTitle.setAttribute('x', (this.chartWidth / 2).toString());
        xTitle.setAttribute('y', (this.chartHeight + 40).toString());
        xTitle.setAttribute('text-anchor', 'middle');
        xTitle.setAttribute('font-size', '14');
        xTitle.setAttribute('font-weight', 'bold');
        xTitle.textContent = '年份';
        group.appendChild(xTitle);
        const yTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yTitle.setAttribute('x', '-40');
        yTitle.setAttribute('y', (this.chartHeight / 2).toString());
        yTitle.setAttribute('text-anchor', 'middle');
        yTitle.setAttribute('font-size', '14');
        yTitle.setAttribute('font-weight', 'bold');
        yTitle.setAttribute('transform', `rotate(-90, -40, ${this.chartHeight / 2})`);
        yTitle.textContent = '格局强度';
        group.appendChild(yTitle);
    }
    /**
     * 绘制趋势线
     * @param group SVG组元素
     */
    drawTrendLine(group) {
        if (this.trendData.length < 2) {
            return;
        }
        // 获取年份范围
        const years = this.trendData.map(point => point.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        // 创建路径
        let pathData = '';
        for (let i = 0; i < this.trendData.length; i++) {
            const point = this.trendData[i];
            const x = this.getXPosition(point.year, minYear, maxYear);
            const y = this.getYPosition(point.strength);
            if (i === 0) {
                pathData += `M ${x} ${y}`;
            }
            else {
                pathData += ` L ${x} ${y}`;
            }
        }
        // 绘制路径
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#3498db');
        path.setAttribute('stroke-width', '2');
        group.appendChild(path);
        // 绘制数据点
        for (let i = 0; i < this.trendData.length; i++) {
            const point = this.trendData[i];
            const x = this.getXPosition(point.year, minYear, maxYear);
            const y = this.getYPosition(point.strength);
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x.toString());
            circle.setAttribute('cy', y.toString());
            circle.setAttribute('r', '4');
            // 根据级别设置颜色
            let fillColor = '#3498db'; // 默认蓝色
            switch (point.level) {
                case 'good':
                    fillColor = '#2ecc71'; // 绿色
                    break;
                case 'bad':
                    fillColor = '#e74c3c'; // 红色
                    break;
                case 'mixed':
                    fillColor = '#f39c12'; // 橙色
                    break;
                case 'neutral':
                    fillColor = '#95a5a6'; // 灰色
                    break;
            }
            circle.setAttribute('fill', fillColor);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '1');
            // 添加提示信息
            circle.setAttribute('data-year', point.year.toString());
            circle.setAttribute('data-strength', point.strength.toFixed(2));
            circle.setAttribute('data-level', point.level);
            // 添加鼠标悬停事件
            circle.addEventListener('mouseover', this.showTooltip.bind(this));
            circle.addEventListener('mouseout', this.hideTooltip.bind(this));
            group.appendChild(circle);
        }
    }
    /**
     * 绘制关键年份标记
     * @param group SVG组元素
     */
    drawKeyYears(group) {
        if (!this.keyYears || this.keyYears.length === 0) {
            return;
        }
        // 获取年份范围
        const years = this.trendData.map(point => point.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        // 绘制关键年份标记
        for (const keyYear of this.keyYears) {
            const x = this.getXPosition(keyYear.year, minYear, maxYear);
            // 找到对应的趋势点
            const trendPoint = this.trendData.find(point => point.year === keyYear.year);
            if (!trendPoint) {
                continue;
            }
            const y = this.getYPosition(trendPoint.strength);
            // 绘制标记
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            marker.setAttribute('d', `M ${x} ${y - 15} L ${x - 5} ${y - 25} L ${x + 5} ${y - 25} Z`);
            // 根据级别设置颜色
            let fillColor = '#3498db'; // 默认蓝色
            switch (keyYear.level) {
                case 'good':
                    fillColor = '#2ecc71'; // 绿色
                    break;
                case 'bad':
                    fillColor = '#e74c3c'; // 红色
                    break;
                case 'mixed':
                    fillColor = '#f39c12'; // 橙色
                    break;
                case 'neutral':
                    fillColor = '#95a5a6'; // 灰色
                    break;
            }
            marker.setAttribute('fill', fillColor);
            marker.setAttribute('stroke', '#fff');
            marker.setAttribute('stroke-width', '1');
            // 添加提示信息
            marker.setAttribute('data-year', keyYear.year.toString());
            marker.setAttribute('data-event', keyYear.event);
            marker.setAttribute('data-level', keyYear.level);
            // 添加鼠标悬停事件
            marker.addEventListener('mouseover', this.showKeyYearTooltip.bind(this));
            marker.addEventListener('mouseout', this.hideTooltip.bind(this));
            group.appendChild(marker);
        }
    }
    /**
     * 绘制图例
     * @param svg SVG元素
     */
    drawLegend(svg) {
        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendGroup.setAttribute('transform', `translate(${this.width - this.padding.right - 100}, ${this.padding.top})`);
        svg.appendChild(legendGroup);
        const levels = [
            { label: '吉', color: '#2ecc71', level: 'good' },
            { label: '凶', color: '#e74c3c', level: 'bad' },
            { label: '中性', color: '#95a5a6', level: 'neutral' },
            { label: '吉凶参半', color: '#f39c12', level: 'mixed' }
        ];
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const y = i * 20;
            // 绘制图例符号
            const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            symbol.setAttribute('cx', '0');
            symbol.setAttribute('cy', y.toString());
            symbol.setAttribute('r', '4');
            symbol.setAttribute('fill', level.color);
            legendGroup.appendChild(symbol);
            // 绘制图例文本
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '10');
            text.setAttribute('y', (y + 4).toString());
            text.setAttribute('font-size', '12');
            text.textContent = level.label;
            legendGroup.appendChild(text);
        }
    }
    /**
     * 显示提示信息
     * @param event 鼠标事件
     */
    showTooltip(event) {
        const target = event.target;
        const year = target.getAttribute('data-year');
        const strength = target.getAttribute('data-strength');
        const level = target.getAttribute('data-level');
        let levelText = '';
        switch (level) {
            case 'good':
                levelText = '吉';
                break;
            case 'bad':
                levelText = '凶';
                break;
            case 'mixed':
                levelText = '吉凶参半';
                break;
            case 'neutral':
                levelText = '中性';
                break;
        }
        const tooltip = document.createElement('div');
        tooltip.className = 'geju-trend-tooltip';
        tooltip.innerHTML = `
      <div>年份: ${year}</div>
      <div>强度: ${strength}</div>
      <div>级别: ${levelText}</div>
    `;
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        document.body.appendChild(tooltip);
    }
    /**
     * 显示关键年份提示信息
     * @param event 鼠标事件
     */
    showKeyYearTooltip(event) {
        const target = event.target;
        const year = target.getAttribute('data-year');
        const eventText = target.getAttribute('data-event');
        const level = target.getAttribute('data-level');
        let levelText = '';
        switch (level) {
            case 'good':
                levelText = '吉';
                break;
            case 'bad':
                levelText = '凶';
                break;
            case 'mixed':
                levelText = '吉凶参半';
                break;
            case 'neutral':
                levelText = '中性';
                break;
        }
        const tooltip = document.createElement('div');
        tooltip.className = 'geju-trend-tooltip';
        tooltip.innerHTML = `
      <div>年份: ${year}</div>
      <div>事件: ${eventText}</div>
      <div>级别: ${levelText}</div>
    `;
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.maxWidth = '300px';
        tooltip.style.whiteSpace = 'normal';
        document.body.appendChild(tooltip);
    }
    /**
     * 隐藏提示信息
     */
    hideTooltip() {
        const tooltips = document.querySelectorAll('.geju-trend-tooltip');
        tooltips.forEach(tooltip => {
            document.body.removeChild(tooltip);
        });
    }
    /**
     * 获取X坐标位置
     * @param year 年份
     * @param minYear 最小年份
     * @param maxYear 最大年份
     * @returns X坐标位置
     */
    getXPosition(year, minYear, maxYear) {
        return ((year - minYear) / (maxYear - minYear)) * this.chartWidth;
    }
    /**
     * 获取Y坐标位置
     * @param strength 强度
     * @returns Y坐标位置
     */
    getYPosition(strength) {
        // 强度范围从-1到1，映射到图表高度
        return this.chartHeight / 2 - (strength * this.chartHeight / 2);
    }
    /**
     * 渲染错误信息
     * @param message 错误信息
     */
    renderError(message) {
        this.container.innerHTML = `
      <div class="geju-trend-error" style="
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        min-height: 200px;
        color: #e74c3c;
        font-size: 16px;
        text-align: center;
      ">
        ${message}
      </div>
    `;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VKdVRyZW5kQ2hhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJHZUp1VHJlbmRDaGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxNQUFNLE9BQU8sY0FBYztJQVV6Qjs7Ozs7OztPQU9HO0lBQ0gsWUFDRSxTQUFzQixFQUN0QixTQUF1QixFQUN2QixRQUF3RixFQUN4RixRQUFnQixHQUFHLEVBQ25CLFNBQWlCLEdBQUc7UUFFcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM1RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDdEUsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzFFLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU07UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNqQyxPQUFPO1NBQ1I7UUFFRCxP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QUFPLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFdBQVcsQ0FBQyxPQUFlO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHOzs7Ozs7Ozs7Ozs7VUFZckIsT0FBTzs7S0FFWixDQUFDO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDmoLzlsYDotovlir/lm77ooajnu4Tku7ZcbiAqIOeUqOS6juWxleekuuagvOWxgOmaj+Wkp+i/kOOAgea1geW5tOWPmOWMlueahOi2i+WKv1xuICovXG5pbXBvcnQgeyBUcmVuZFBvaW50IH0gZnJvbSAnLi4vc2VydmljZXMvR2VKdVRyZW5kU2VydmljZSc7XG5cbmV4cG9ydCBjbGFzcyBHZUp1VHJlbmRDaGFydCB7XG4gIHByaXZhdGUgY29udGFpbmVyOiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSB0cmVuZERhdGE6IFRyZW5kUG9pbnRbXTtcbiAgcHJpdmF0ZSBrZXlZZWFyczogeyB5ZWFyOiBudW1iZXI7IGV2ZW50OiBzdHJpbmc7IGxldmVsOiAnZ29vZCcgfCAnYmFkJyB8ICduZXV0cmFsJyB8ICdtaXhlZCcgfVtdO1xuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG4gIHByaXZhdGUgcGFkZGluZzogeyB0b3A6IG51bWJlcjsgcmlnaHQ6IG51bWJlcjsgYm90dG9tOiBudW1iZXI7IGxlZnQ6IG51bWJlciB9O1xuICBwcml2YXRlIGNoYXJ0V2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFydEhlaWdodDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiDmnoTpgKDlh73mlbBcbiAgICogQHBhcmFtIGNvbnRhaW5lciDlrrnlmajlhYPntKBcbiAgICogQHBhcmFtIHRyZW5kRGF0YSDotovlir/mlbDmja5cbiAgICogQHBhcmFtIGtleVllYXJzIOWFs+mUruW5tOS7vVxuICAgKiBAcGFyYW0gd2lkdGgg5Zu+6KGo5a695bqmXG4gICAqIEBwYXJhbSBoZWlnaHQg5Zu+6KGo6auY5bqmXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgIHRyZW5kRGF0YTogVHJlbmRQb2ludFtdLFxuICAgIGtleVllYXJzOiB7IHllYXI6IG51bWJlcjsgZXZlbnQ6IHN0cmluZzsgbGV2ZWw6ICdnb29kJyB8ICdiYWQnIHwgJ25ldXRyYWwnIHwgJ21peGVkJyB9W10sXG4gICAgd2lkdGg6IG51bWJlciA9IDgwMCxcbiAgICBoZWlnaHQ6IG51bWJlciA9IDQwMFxuICApIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB0aGlzLnRyZW5kRGF0YSA9IHRyZW5kRGF0YTtcbiAgICB0aGlzLmtleVllYXJzID0ga2V5WWVhcnM7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucGFkZGluZyA9IHsgdG9wOiA0MCwgcmlnaHQ6IDQwLCBib3R0b206IDYwLCBsZWZ0OiA2MCB9O1xuICAgIHRoaXMuY2hhcnRXaWR0aCA9IHRoaXMud2lkdGggLSB0aGlzLnBhZGRpbmcubGVmdCAtIHRoaXMucGFkZGluZy5yaWdodDtcbiAgICB0aGlzLmNoYXJ0SGVpZ2h0ID0gdGhpcy5oZWlnaHQgLSB0aGlzLnBhZGRpbmcudG9wIC0gdGhpcy5wYWRkaW5nLmJvdHRvbTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmuLLmn5Plm77ooahcbiAgICovXG4gIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnRyZW5kRGF0YSB8fCB0aGlzLnRyZW5kRGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMucmVuZGVyRXJyb3IoJ+aXoOazlea4suafk+WbvuihqO+8jOaVsOaNruS4jei2s+OAgicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOa4heepuuWuueWZqFxuICAgIHRoaXMuY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgLy8g5Yib5bu6U1ZH5YWD57SgXG4gICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGgudG9TdHJpbmcoKSk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQudG9TdHJpbmcoKSk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnZ2VqdS10cmVuZC1jaGFydCcpO1xuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHN2Zyk7XG5cbiAgICAvLyDliJvlu7rlm77ooajnu4RcbiAgICBjb25zdCBjaGFydEdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdnJyk7XG4gICAgY2hhcnRHcm91cC5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt0aGlzLnBhZGRpbmcubGVmdH0sICR7dGhpcy5wYWRkaW5nLnRvcH0pYCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNoYXJ0R3JvdXApO1xuXG4gICAgLy8g57uY5Yi25Z2Q5qCH6L20XG4gICAgdGhpcy5kcmF3QXhlcyhjaGFydEdyb3VwKTtcblxuICAgIC8vIOe7mOWItui2i+WKv+e6v1xuICAgIHRoaXMuZHJhd1RyZW5kTGluZShjaGFydEdyb3VwKTtcblxuICAgIC8vIOe7mOWItuWFs+mUruW5tOS7veagh+iusFxuICAgIHRoaXMuZHJhd0tleVllYXJzKGNoYXJ0R3JvdXApO1xuXG4gICAgLy8g57uY5Yi25Zu+5L6LXG4gICAgdGhpcy5kcmF3TGVnZW5kKHN2Zyk7XG4gIH1cblxuICAvKipcbiAgICog57uY5Yi25Z2Q5qCH6L20XG4gICAqIEBwYXJhbSBncm91cCBTVkfnu4TlhYPntKBcbiAgICovXG4gIHByaXZhdGUgZHJhd0F4ZXMoZ3JvdXA6IFNWR0dFbGVtZW50KTogdm9pZCB7XG4gICAgLy8g6I635Y+W5bm05Lu96IyD5Zu0XG4gICAgY29uc3QgeWVhcnMgPSB0aGlzLnRyZW5kRGF0YS5tYXAocG9pbnQgPT4gcG9pbnQueWVhcik7XG4gICAgY29uc3QgbWluWWVhciA9IE1hdGgubWluKC4uLnllYXJzKTtcbiAgICBjb25zdCBtYXhZZWFyID0gTWF0aC5tYXgoLi4ueWVhcnMpO1xuXG4gICAgLy8g5Yib5bu6WOi9tFxuICAgIGNvbnN0IHhBeGlzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdsaW5lJyk7XG4gICAgeEF4aXMuc2V0QXR0cmlidXRlKCd4MScsICcwJyk7XG4gICAgeEF4aXMuc2V0QXR0cmlidXRlKCd5MScsICh0aGlzLmNoYXJ0SGVpZ2h0IC8gMikudG9TdHJpbmcoKSk7XG4gICAgeEF4aXMuc2V0QXR0cmlidXRlKCd4MicsIHRoaXMuY2hhcnRXaWR0aC50b1N0cmluZygpKTtcbiAgICB4QXhpcy5zZXRBdHRyaWJ1dGUoJ3kyJywgKHRoaXMuY2hhcnRIZWlnaHQgLyAyKS50b1N0cmluZygpKTtcbiAgICB4QXhpcy5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsICcjOTk5Jyk7XG4gICAgeEF4aXMuc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLCAnMScpO1xuICAgIGdyb3VwLmFwcGVuZENoaWxkKHhBeGlzKTtcblxuICAgIC8vIOWIm+W7ulnovbRcbiAgICBjb25zdCB5QXhpcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnbGluZScpO1xuICAgIHlBeGlzLnNldEF0dHJpYnV0ZSgneDEnLCAnMCcpO1xuICAgIHlBeGlzLnNldEF0dHJpYnV0ZSgneTEnLCAnMCcpO1xuICAgIHlBeGlzLnNldEF0dHJpYnV0ZSgneDInLCAnMCcpO1xuICAgIHlBeGlzLnNldEF0dHJpYnV0ZSgneTInLCB0aGlzLmNoYXJ0SGVpZ2h0LnRvU3RyaW5nKCkpO1xuICAgIHlBeGlzLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgJyM5OTknKTtcbiAgICB5QXhpcy5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsICcxJyk7XG4gICAgZ3JvdXAuYXBwZW5kQ2hpbGQoeUF4aXMpO1xuXG4gICAgLy8g57uY5Yi2WOi9tOWIu+W6plxuICAgIGNvbnN0IHllYXJTdGVwID0gTWF0aC5jZWlsKChtYXhZZWFyIC0gbWluWWVhcikgLyAxMCk7IC8vIOacgOWkmuaYvuekujEw5Liq5Yi75bqmXG4gICAgZm9yIChsZXQgeWVhciA9IG1pblllYXI7IHllYXIgPD0gbWF4WWVhcjsgeWVhciArPSB5ZWFyU3RlcCkge1xuICAgICAgY29uc3QgeCA9IHRoaXMuZ2V0WFBvc2l0aW9uKHllYXIsIG1pblllYXIsIG1heFllYXIpO1xuICAgICAgXG4gICAgICAvLyDnu5jliLbliLvluqbnur9cbiAgICAgIGNvbnN0IHRpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ2xpbmUnKTtcbiAgICAgIHRpY2suc2V0QXR0cmlidXRlKCd4MScsIHgudG9TdHJpbmcoKSk7XG4gICAgICB0aWNrLnNldEF0dHJpYnV0ZSgneTEnLCAodGhpcy5jaGFydEhlaWdodCAvIDIgLSA1KS50b1N0cmluZygpKTtcbiAgICAgIHRpY2suc2V0QXR0cmlidXRlKCd4MicsIHgudG9TdHJpbmcoKSk7XG4gICAgICB0aWNrLnNldEF0dHJpYnV0ZSgneTInLCAodGhpcy5jaGFydEhlaWdodCAvIDIgKyA1KS50b1N0cmluZygpKTtcbiAgICAgIHRpY2suc2V0QXR0cmlidXRlKCdzdHJva2UnLCAnIzk5OScpO1xuICAgICAgdGljay5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsICcxJyk7XG4gICAgICBncm91cC5hcHBlbmRDaGlsZCh0aWNrKTtcblxuICAgICAgLy8g57uY5Yi25Yi75bqm5paH5pysXG4gICAgICBjb25zdCB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICd0ZXh0Jyk7XG4gICAgICB0ZXh0LnNldEF0dHJpYnV0ZSgneCcsIHgudG9TdHJpbmcoKSk7XG4gICAgICB0ZXh0LnNldEF0dHJpYnV0ZSgneScsICh0aGlzLmNoYXJ0SGVpZ2h0IC8gMiArIDIwKS50b1N0cmluZygpKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCdmb250LXNpemUnLCAnMTInKTtcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSB5ZWFyLnRvU3RyaW5nKCk7XG4gICAgICBncm91cC5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICB9XG5cbiAgICAvLyDnu5jliLZZ6L205Yi75bqmXG4gICAgY29uc3Qgc3RyZW5ndGhMZXZlbHMgPSBbLTEsIC0wLjUsIDAsIDAuNSwgMV07XG4gICAgY29uc3Qgc3RyZW5ndGhMYWJlbHMgPSBbJ+aegeW8sScsICflvLEnLCAn5bmz6KGhJywgJ+W8uicsICfmnoHlvLonXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmVuZ3RoTGV2ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBzdHJlbmd0aCA9IHN0cmVuZ3RoTGV2ZWxzW2ldO1xuICAgICAgY29uc3QgeSA9IHRoaXMuZ2V0WVBvc2l0aW9uKHN0cmVuZ3RoKTtcbiAgICAgIFxuICAgICAgLy8g57uY5Yi25Yi75bqm57q/XG4gICAgICBjb25zdCB0aWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdsaW5lJyk7XG4gICAgICB0aWNrLnNldEF0dHJpYnV0ZSgneDEnLCAnLTUnKTtcbiAgICAgIHRpY2suc2V0QXR0cmlidXRlKCd5MScsIHkudG9TdHJpbmcoKSk7XG4gICAgICB0aWNrLnNldEF0dHJpYnV0ZSgneDInLCAnNScpO1xuICAgICAgdGljay5zZXRBdHRyaWJ1dGUoJ3kyJywgeS50b1N0cmluZygpKTtcbiAgICAgIHRpY2suc2V0QXR0cmlidXRlKCdzdHJva2UnLCAnIzk5OScpO1xuICAgICAgdGljay5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsICcxJyk7XG4gICAgICBncm91cC5hcHBlbmRDaGlsZCh0aWNrKTtcblxuICAgICAgLy8g57uY5Yi25Yi75bqm5paH5pysXG4gICAgICBjb25zdCB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICd0ZXh0Jyk7XG4gICAgICB0ZXh0LnNldEF0dHJpYnV0ZSgneCcsICctMTAnKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCd5JywgKHkgKyA1KS50b1N0cmluZygpKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCd0ZXh0LWFuY2hvcicsICdlbmQnKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCdmb250LXNpemUnLCAnMTInKTtcbiAgICAgIHRleHQudGV4dENvbnRlbnQgPSBzdHJlbmd0aExhYmVsc1tpXTtcbiAgICAgIGdyb3VwLmFwcGVuZENoaWxkKHRleHQpO1xuXG4gICAgICAvLyDnu5jliLbmsLTlubPlj4LogIPnur9cbiAgICAgIGlmIChzdHJlbmd0aCAhPT0gMCkge1xuICAgICAgICBjb25zdCByZWZlcmVuY2VMaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdsaW5lJyk7XG4gICAgICAgIHJlZmVyZW5jZUxpbmUuc2V0QXR0cmlidXRlKCd4MScsICcwJyk7XG4gICAgICAgIHJlZmVyZW5jZUxpbmUuc2V0QXR0cmlidXRlKCd5MScsIHkudG9TdHJpbmcoKSk7XG4gICAgICAgIHJlZmVyZW5jZUxpbmUuc2V0QXR0cmlidXRlKCd4MicsIHRoaXMuY2hhcnRXaWR0aC50b1N0cmluZygpKTtcbiAgICAgICAgcmVmZXJlbmNlTGluZS5zZXRBdHRyaWJ1dGUoJ3kyJywgeS50b1N0cmluZygpKTtcbiAgICAgICAgcmVmZXJlbmNlTGluZS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsICcjZGRkJyk7XG4gICAgICAgIHJlZmVyZW5jZUxpbmUuc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLCAnMScpO1xuICAgICAgICByZWZlcmVuY2VMaW5lLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWRhc2hhcnJheScsICc1LDUnKTtcbiAgICAgICAgZ3JvdXAuYXBwZW5kQ2hpbGQocmVmZXJlbmNlTGluZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5re75Yqg5Z2Q5qCH6L205qCH6aKYXG4gICAgY29uc3QgeFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICd0ZXh0Jyk7XG4gICAgeFRpdGxlLnNldEF0dHJpYnV0ZSgneCcsICh0aGlzLmNoYXJ0V2lkdGggLyAyKS50b1N0cmluZygpKTtcbiAgICB4VGl0bGUuc2V0QXR0cmlidXRlKCd5JywgKHRoaXMuY2hhcnRIZWlnaHQgKyA0MCkudG9TdHJpbmcoKSk7XG4gICAgeFRpdGxlLnNldEF0dHJpYnV0ZSgndGV4dC1hbmNob3InLCAnbWlkZGxlJyk7XG4gICAgeFRpdGxlLnNldEF0dHJpYnV0ZSgnZm9udC1zaXplJywgJzE0Jyk7XG4gICAgeFRpdGxlLnNldEF0dHJpYnV0ZSgnZm9udC13ZWlnaHQnLCAnYm9sZCcpO1xuICAgIHhUaXRsZS50ZXh0Q29udGVudCA9ICflubTku70nO1xuICAgIGdyb3VwLmFwcGVuZENoaWxkKHhUaXRsZSk7XG5cbiAgICBjb25zdCB5VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3RleHQnKTtcbiAgICB5VGl0bGUuc2V0QXR0cmlidXRlKCd4JywgJy00MCcpO1xuICAgIHlUaXRsZS5zZXRBdHRyaWJ1dGUoJ3knLCAodGhpcy5jaGFydEhlaWdodCAvIDIpLnRvU3RyaW5nKCkpO1xuICAgIHlUaXRsZS5zZXRBdHRyaWJ1dGUoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpO1xuICAgIHlUaXRsZS5zZXRBdHRyaWJ1dGUoJ2ZvbnQtc2l6ZScsICcxNCcpO1xuICAgIHlUaXRsZS5zZXRBdHRyaWJ1dGUoJ2ZvbnQtd2VpZ2h0JywgJ2JvbGQnKTtcbiAgICB5VGl0bGUuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCBgcm90YXRlKC05MCwgLTQwLCAke3RoaXMuY2hhcnRIZWlnaHQgLyAyfSlgKTtcbiAgICB5VGl0bGUudGV4dENvbnRlbnQgPSAn5qC85bGA5by65bqmJztcbiAgICBncm91cC5hcHBlbmRDaGlsZCh5VGl0bGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIOe7mOWItui2i+WKv+e6v1xuICAgKiBAcGFyYW0gZ3JvdXAgU1ZH57uE5YWD57SgXG4gICAqL1xuICBwcml2YXRlIGRyYXdUcmVuZExpbmUoZ3JvdXA6IFNWR0dFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHJlbmREYXRhLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDojrflj5blubTku73ojIPlm7RcbiAgICBjb25zdCB5ZWFycyA9IHRoaXMudHJlbmREYXRhLm1hcChwb2ludCA9PiBwb2ludC55ZWFyKTtcbiAgICBjb25zdCBtaW5ZZWFyID0gTWF0aC5taW4oLi4ueWVhcnMpO1xuICAgIGNvbnN0IG1heFllYXIgPSBNYXRoLm1heCguLi55ZWFycyk7XG5cbiAgICAvLyDliJvlu7rot6/lvoRcbiAgICBsZXQgcGF0aERhdGEgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudHJlbmREYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMudHJlbmREYXRhW2ldO1xuICAgICAgY29uc3QgeCA9IHRoaXMuZ2V0WFBvc2l0aW9uKHBvaW50LnllYXIsIG1pblllYXIsIG1heFllYXIpO1xuICAgICAgY29uc3QgeSA9IHRoaXMuZ2V0WVBvc2l0aW9uKHBvaW50LnN0cmVuZ3RoKTtcbiAgICAgIFxuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgcGF0aERhdGEgKz0gYE0gJHt4fSAke3l9YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdGhEYXRhICs9IGAgTCAke3h9ICR7eX1gO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOe7mOWItui3r+W+hFxuICAgIGNvbnN0IHBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3BhdGgnKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZSgnZCcsIHBhdGhEYXRhKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZSgnZmlsbCcsICdub25lJyk7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsICcjMzQ5OGRiJyk7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsICcyJyk7XG4gICAgZ3JvdXAuYXBwZW5kQ2hpbGQocGF0aCk7XG5cbiAgICAvLyDnu5jliLbmlbDmja7ngrlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudHJlbmREYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMudHJlbmREYXRhW2ldO1xuICAgICAgY29uc3QgeCA9IHRoaXMuZ2V0WFBvc2l0aW9uKHBvaW50LnllYXIsIG1pblllYXIsIG1heFllYXIpO1xuICAgICAgY29uc3QgeSA9IHRoaXMuZ2V0WVBvc2l0aW9uKHBvaW50LnN0cmVuZ3RoKTtcbiAgICAgIFxuICAgICAgY29uc3QgY2lyY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdjaXJjbGUnKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ2N4JywgeC50b1N0cmluZygpKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ2N5JywgeS50b1N0cmluZygpKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ3InLCAnNCcpO1xuICAgICAgXG4gICAgICAvLyDmoLnmja7nuqfliKvorr7nva7popzoibJcbiAgICAgIGxldCBmaWxsQ29sb3IgPSAnIzM0OThkYic7IC8vIOm7mOiupOiTneiJslxuICAgICAgc3dpdGNoIChwb2ludC5sZXZlbCkge1xuICAgICAgICBjYXNlICdnb29kJzpcbiAgICAgICAgICBmaWxsQ29sb3IgPSAnIzJlY2M3MSc7IC8vIOe7v+iJslxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdiYWQnOlxuICAgICAgICAgIGZpbGxDb2xvciA9ICcjZTc0YzNjJzsgLy8g57qi6ImyXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21peGVkJzpcbiAgICAgICAgICBmaWxsQ29sb3IgPSAnI2YzOWMxMic7IC8vIOapmeiJslxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICduZXV0cmFsJzpcbiAgICAgICAgICBmaWxsQ29sb3IgPSAnIzk1YTVhNic7IC8vIOeBsOiJslxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdmaWxsJywgZmlsbENvbG9yKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsICcjZmZmJyk7XG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLCAnMScpO1xuICAgICAgXG4gICAgICAvLyDmt7vliqDmj5DnpLrkv6Hmga9cbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ2RhdGEteWVhcicsIHBvaW50LnllYXIudG9TdHJpbmcoKSk7XG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdkYXRhLXN0cmVuZ3RoJywgcG9pbnQuc3RyZW5ndGgudG9GaXhlZCgyKSk7XG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdkYXRhLWxldmVsJywgcG9pbnQubGV2ZWwpO1xuICAgICAgXG4gICAgICAvLyDmt7vliqDpvKDmoIfmgqzlgZzkuovku7ZcbiAgICAgIGNpcmNsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLnNob3dUb29sdGlwLmJpbmQodGhpcykpO1xuICAgICAgY2lyY2xlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgdGhpcy5oaWRlVG9vbHRpcC5iaW5kKHRoaXMpKTtcbiAgICAgIFxuICAgICAgZ3JvdXAuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog57uY5Yi25YWz6ZSu5bm05Lu95qCH6K6wXG4gICAqIEBwYXJhbSBncm91cCBTVkfnu4TlhYPntKBcbiAgICovXG4gIHByaXZhdGUgZHJhd0tleVllYXJzKGdyb3VwOiBTVkdHRWxlbWVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5rZXlZZWFycyB8fCB0aGlzLmtleVllYXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOiOt+WPluW5tOS7veiMg+WbtFxuICAgIGNvbnN0IHllYXJzID0gdGhpcy50cmVuZERhdGEubWFwKHBvaW50ID0+IHBvaW50LnllYXIpO1xuICAgIGNvbnN0IG1pblllYXIgPSBNYXRoLm1pbiguLi55ZWFycyk7XG4gICAgY29uc3QgbWF4WWVhciA9IE1hdGgubWF4KC4uLnllYXJzKTtcblxuICAgIC8vIOe7mOWItuWFs+mUruW5tOS7veagh+iusFxuICAgIGZvciAoY29uc3Qga2V5WWVhciBvZiB0aGlzLmtleVllYXJzKSB7XG4gICAgICBjb25zdCB4ID0gdGhpcy5nZXRYUG9zaXRpb24oa2V5WWVhci55ZWFyLCBtaW5ZZWFyLCBtYXhZZWFyKTtcbiAgICAgIFxuICAgICAgLy8g5om+5Yiw5a+55bqU55qE6LaL5Yq/54K5XG4gICAgICBjb25zdCB0cmVuZFBvaW50ID0gdGhpcy50cmVuZERhdGEuZmluZChwb2ludCA9PiBwb2ludC55ZWFyID09PSBrZXlZZWFyLnllYXIpO1xuICAgICAgaWYgKCF0cmVuZFBvaW50KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCB5ID0gdGhpcy5nZXRZUG9zaXRpb24odHJlbmRQb2ludC5zdHJlbmd0aCk7XG4gICAgICBcbiAgICAgIC8vIOe7mOWItuagh+iusFxuICAgICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdwYXRoJyk7XG4gICAgICBtYXJrZXIuc2V0QXR0cmlidXRlKCdkJywgYE0gJHt4fSAke3kgLSAxNX0gTCAke3ggLSA1fSAke3kgLSAyNX0gTCAke3ggKyA1fSAke3kgLSAyNX0gWmApO1xuICAgICAgXG4gICAgICAvLyDmoLnmja7nuqfliKvorr7nva7popzoibJcbiAgICAgIGxldCBmaWxsQ29sb3IgPSAnIzM0OThkYic7IC8vIOm7mOiupOiTneiJslxuICAgICAgc3dpdGNoIChrZXlZZWFyLmxldmVsKSB7XG4gICAgICAgIGNhc2UgJ2dvb2QnOlxuICAgICAgICAgIGZpbGxDb2xvciA9ICcjMmVjYzcxJzsgLy8g57u/6ImyXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2JhZCc6XG4gICAgICAgICAgZmlsbENvbG9yID0gJyNlNzRjM2MnOyAvLyDnuqLoibJcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgICAgIGZpbGxDb2xvciA9ICcjZjM5YzEyJzsgLy8g5qmZ6ImyXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ25ldXRyYWwnOlxuICAgICAgICAgIGZpbGxDb2xvciA9ICcjOTVhNWE2JzsgLy8g54Gw6ImyXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBcbiAgICAgIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCBmaWxsQ29sb3IpO1xuICAgICAgbWFya2VyLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgJyNmZmYnKTtcbiAgICAgIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsICcxJyk7XG4gICAgICBcbiAgICAgIC8vIOa3u+WKoOaPkOekuuS/oeaBr1xuICAgICAgbWFya2VyLnNldEF0dHJpYnV0ZSgnZGF0YS15ZWFyJywga2V5WWVhci55ZWFyLnRvU3RyaW5nKCkpO1xuICAgICAgbWFya2VyLnNldEF0dHJpYnV0ZSgnZGF0YS1ldmVudCcsIGtleVllYXIuZXZlbnQpO1xuICAgICAgbWFya2VyLnNldEF0dHJpYnV0ZSgnZGF0YS1sZXZlbCcsIGtleVllYXIubGV2ZWwpO1xuICAgICAgXG4gICAgICAvLyDmt7vliqDpvKDmoIfmgqzlgZzkuovku7ZcbiAgICAgIG1hcmtlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLnNob3dLZXlZZWFyVG9vbHRpcC5iaW5kKHRoaXMpKTtcbiAgICAgIG1hcmtlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMuaGlkZVRvb2x0aXAuYmluZCh0aGlzKSk7XG4gICAgICBcbiAgICAgIGdyb3VwLmFwcGVuZENoaWxkKG1hcmtlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOe7mOWItuWbvuS+i1xuICAgKiBAcGFyYW0gc3ZnIFNWR+WFg+e0oFxuICAgKi9cbiAgcHJpdmF0ZSBkcmF3TGVnZW5kKHN2ZzogU1ZHRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGxlZ2VuZEdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdnJyk7XG4gICAgbGVnZW5kR3JvdXAuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7dGhpcy53aWR0aCAtIHRoaXMucGFkZGluZy5yaWdodCAtIDEwMH0sICR7dGhpcy5wYWRkaW5nLnRvcH0pYCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGxlZ2VuZEdyb3VwKTtcblxuICAgIGNvbnN0IGxldmVscyA9IFtcbiAgICAgIHsgbGFiZWw6ICflkIknLCBjb2xvcjogJyMyZWNjNzEnLCBsZXZlbDogJ2dvb2QnIH0sXG4gICAgICB7IGxhYmVsOiAn5Ye2JywgY29sb3I6ICcjZTc0YzNjJywgbGV2ZWw6ICdiYWQnIH0sXG4gICAgICB7IGxhYmVsOiAn5Lit5oCnJywgY29sb3I6ICcjOTVhNWE2JywgbGV2ZWw6ICduZXV0cmFsJyB9LFxuICAgICAgeyBsYWJlbDogJ+WQieWHtuWPguWNiicsIGNvbG9yOiAnI2YzOWMxMicsIGxldmVsOiAnbWl4ZWQnIH1cbiAgICBdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZXZlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGxldmVsID0gbGV2ZWxzW2ldO1xuICAgICAgY29uc3QgeSA9IGkgKiAyMDtcblxuICAgICAgLy8g57uY5Yi25Zu+5L6L56ym5Y+3XG4gICAgICBjb25zdCBzeW1ib2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ2NpcmNsZScpO1xuICAgICAgc3ltYm9sLnNldEF0dHJpYnV0ZSgnY3gnLCAnMCcpO1xuICAgICAgc3ltYm9sLnNldEF0dHJpYnV0ZSgnY3knLCB5LnRvU3RyaW5nKCkpO1xuICAgICAgc3ltYm9sLnNldEF0dHJpYnV0ZSgncicsICc0Jyk7XG4gICAgICBzeW1ib2wuc2V0QXR0cmlidXRlKCdmaWxsJywgbGV2ZWwuY29sb3IpO1xuICAgICAgbGVnZW5kR3JvdXAuYXBwZW5kQ2hpbGQoc3ltYm9sKTtcblxuICAgICAgLy8g57uY5Yi25Zu+5L6L5paH5pysXG4gICAgICBjb25zdCB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICd0ZXh0Jyk7XG4gICAgICB0ZXh0LnNldEF0dHJpYnV0ZSgneCcsICcxMCcpO1xuICAgICAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3knLCAoeSArIDQpLnRvU3RyaW5nKCkpO1xuICAgICAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2ZvbnQtc2l6ZScsICcxMicpO1xuICAgICAgdGV4dC50ZXh0Q29udGVudCA9IGxldmVsLmxhYmVsO1xuICAgICAgbGVnZW5kR3JvdXAuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuaPkOekuuS/oeaBr1xuICAgKiBAcGFyYW0gZXZlbnQg6byg5qCH5LqL5Lu2XG4gICAqL1xuICBwcml2YXRlIHNob3dUb29sdGlwKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIFNWR0NpcmNsZUVsZW1lbnQ7XG4gICAgY29uc3QgeWVhciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteWVhcicpO1xuICAgIGNvbnN0IHN0cmVuZ3RoID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zdHJlbmd0aCcpO1xuICAgIGNvbnN0IGxldmVsID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1sZXZlbCcpO1xuXG4gICAgbGV0IGxldmVsVGV4dCA9ICcnO1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgJ2dvb2QnOlxuICAgICAgICBsZXZlbFRleHQgPSAn5ZCJJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdiYWQnOlxuICAgICAgICBsZXZlbFRleHQgPSAn5Ye2JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtaXhlZCc6XG4gICAgICAgIGxldmVsVGV4dCA9ICflkInlh7blj4LljYonO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25ldXRyYWwnOlxuICAgICAgICBsZXZlbFRleHQgPSAn5Lit5oCnJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2dlanUtdHJlbmQtdG9vbHRpcCc7XG4gICAgdG9vbHRpcC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2PuW5tOS7vTogJHt5ZWFyfTwvZGl2PlxuICAgICAgPGRpdj7lvLrluqY6ICR7c3RyZW5ndGh9PC9kaXY+XG4gICAgICA8ZGl2Pue6p+WIqzogJHtsZXZlbFRleHR9PC9kaXY+XG4gICAgYDtcbiAgICB0b29sdGlwLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHtldmVudC5wYWdlWCArIDEwfXB4YDtcbiAgICB0b29sdGlwLnN0eWxlLnRvcCA9IGAke2V2ZW50LnBhZ2VZICsgMTB9cHhgO1xuICAgIHRvb2x0aXAuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwgMCwgMCwgMC44KSc7XG4gICAgdG9vbHRpcC5zdHlsZS5jb2xvciA9ICcjZmZmJztcbiAgICB0b29sdGlwLnN0eWxlLnBhZGRpbmcgPSAnNXB4IDEwcHgnO1xuICAgIHRvb2x0aXAuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgdG9vbHRpcC5zdHlsZS5mb250U2l6ZSA9ICcxMnB4JztcbiAgICB0b29sdGlwLnN0eWxlLnpJbmRleCA9ICcxMDAwJztcbiAgICB0b29sdGlwLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuWFs+mUruW5tOS7veaPkOekuuS/oeaBr1xuICAgKiBAcGFyYW0gZXZlbnQg6byg5qCH5LqL5Lu2XG4gICAqL1xuICBwcml2YXRlIHNob3dLZXlZZWFyVG9vbHRpcChldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBTVkdQYXRoRWxlbWVudDtcbiAgICBjb25zdCB5ZWFyID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15ZWFyJyk7XG4gICAgY29uc3QgZXZlbnRUZXh0ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1ldmVudCcpO1xuICAgIGNvbnN0IGxldmVsID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1sZXZlbCcpO1xuXG4gICAgbGV0IGxldmVsVGV4dCA9ICcnO1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgJ2dvb2QnOlxuICAgICAgICBsZXZlbFRleHQgPSAn5ZCJJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdiYWQnOlxuICAgICAgICBsZXZlbFRleHQgPSAn5Ye2JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtaXhlZCc6XG4gICAgICAgIGxldmVsVGV4dCA9ICflkInlh7blj4LljYonO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25ldXRyYWwnOlxuICAgICAgICBsZXZlbFRleHQgPSAn5Lit5oCnJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2dlanUtdHJlbmQtdG9vbHRpcCc7XG4gICAgdG9vbHRpcC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2PuW5tOS7vTogJHt5ZWFyfTwvZGl2PlxuICAgICAgPGRpdj7kuovku7Y6ICR7ZXZlbnRUZXh0fTwvZGl2PlxuICAgICAgPGRpdj7nuqfliKs6ICR7bGV2ZWxUZXh0fTwvZGl2PlxuICAgIGA7XG4gICAgdG9vbHRpcC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7ZXZlbnQucGFnZVggKyAxMH1weGA7XG4gICAgdG9vbHRpcC5zdHlsZS50b3AgPSBgJHtldmVudC5wYWdlWSArIDEwfXB4YDtcbiAgICB0b29sdGlwLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDAuOCknO1xuICAgIHRvb2x0aXAuc3R5bGUuY29sb3IgPSAnI2ZmZic7XG4gICAgdG9vbHRpcC5zdHlsZS5wYWRkaW5nID0gJzVweCAxMHB4JztcbiAgICB0b29sdGlwLnN0eWxlLmJvcmRlclJhZGl1cyA9ICc0cHgnO1xuICAgIHRvb2x0aXAuc3R5bGUuZm9udFNpemUgPSAnMTJweCc7XG4gICAgdG9vbHRpcC5zdHlsZS56SW5kZXggPSAnMTAwMCc7XG4gICAgdG9vbHRpcC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgIHRvb2x0aXAuc3R5bGUubWF4V2lkdGggPSAnMzAwcHgnO1xuICAgIHRvb2x0aXAuc3R5bGUud2hpdGVTcGFjZSA9ICdub3JtYWwnO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b29sdGlwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDpmpDol4/mj5DnpLrkv6Hmga9cbiAgICovXG4gIHByaXZhdGUgaGlkZVRvb2x0aXAoKTogdm9pZCB7XG4gICAgY29uc3QgdG9vbHRpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2VqdS10cmVuZC10b29sdGlwJyk7XG4gICAgdG9vbHRpcHMuZm9yRWFjaCh0b29sdGlwID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodG9vbHRpcCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+WWOWdkOagh+S9jee9rlxuICAgKiBAcGFyYW0geWVhciDlubTku71cbiAgICogQHBhcmFtIG1pblllYXIg5pyA5bCP5bm05Lu9XG4gICAqIEBwYXJhbSBtYXhZZWFyIOacgOWkp+W5tOS7vVxuICAgKiBAcmV0dXJucyBY5Z2Q5qCH5L2N572uXG4gICAqL1xuICBwcml2YXRlIGdldFhQb3NpdGlvbih5ZWFyOiBudW1iZXIsIG1pblllYXI6IG51bWJlciwgbWF4WWVhcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKCh5ZWFyIC0gbWluWWVhcikgLyAobWF4WWVhciAtIG1pblllYXIpKSAqIHRoaXMuY2hhcnRXaWR0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5ZZ5Z2Q5qCH5L2N572uXG4gICAqIEBwYXJhbSBzdHJlbmd0aCDlvLrluqZcbiAgICogQHJldHVybnMgWeWdkOagh+S9jee9rlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRZUG9zaXRpb24oc3RyZW5ndGg6IG51bWJlcik6IG51bWJlciB7XG4gICAgLy8g5by65bqm6IyD5Zu05LuOLTHliLAx77yM5pig5bCE5Yiw5Zu+6KGo6auY5bqmXG4gICAgcmV0dXJuIHRoaXMuY2hhcnRIZWlnaHQgLyAyIC0gKHN0cmVuZ3RoICogdGhpcy5jaGFydEhlaWdodCAvIDIpO1xuICB9XG5cbiAgLyoqXG4gICAqIOa4suafk+mUmeivr+S/oeaBr1xuICAgKiBAcGFyYW0gbWVzc2FnZSDplJnor6/kv6Hmga9cbiAgICovXG4gIHByaXZhdGUgcmVuZGVyRXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jb250YWluZXIuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImdlanUtdHJlbmQtZXJyb3JcIiBzdHlsZT1cIlxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgbWluLWhlaWdodDogMjAwcHg7XG4gICAgICAgIGNvbG9yOiAjZTc0YzNjO1xuICAgICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgIFwiPlxuICAgICAgICAke21lc3NhZ2V9XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG59XG4iXX0=