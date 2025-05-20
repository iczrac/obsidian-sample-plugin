/**
 * 格局趋势图表组件
 * 用于展示格局随大运、流年变化的趋势
 */
import { TrendPoint } from '../services/GeJuTrendService';

export class GeJuTrendChart {
  private container: HTMLElement;
  private trendData: TrendPoint[];
  private keyYears: { year: number; event: string; level: 'good' | 'bad' | 'neutral' | 'mixed' }[];
  private width: number;
  private height: number;
  private padding: { top: number; right: number; bottom: number; left: number };
  private chartWidth: number;
  private chartHeight: number;

  /**
   * 构造函数
   * @param container 容器元素
   * @param trendData 趋势数据
   * @param keyYears 关键年份
   * @param width 图表宽度
   * @param height 图表高度
   */
  constructor(
    container: HTMLElement,
    trendData: TrendPoint[],
    keyYears: { year: number; event: string; level: 'good' | 'bad' | 'neutral' | 'mixed' }[],
    width: number = 800,
    height: number = 400
  ) {
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
  public render(): void {
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
  private drawAxes(group: SVGGElement): void {
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
  private drawTrendLine(group: SVGGElement): void {
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
      } else {
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
  private drawKeyYears(group: SVGGElement): void {
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
  private drawLegend(svg: SVGElement): void {
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
  private showTooltip(event: MouseEvent): void {
    const target = event.target as SVGCircleElement;
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
  private showKeyYearTooltip(event: MouseEvent): void {
    const target = event.target as SVGPathElement;
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
  private hideTooltip(): void {
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
  private getXPosition(year: number, minYear: number, maxYear: number): number {
    return ((year - minYear) / (maxYear - minYear)) * this.chartWidth;
  }

  /**
   * 获取Y坐标位置
   * @param strength 强度
   * @returns Y坐标位置
   */
  private getYPosition(strength: number): number {
    // 强度范围从-1到1，映射到图表高度
    return this.chartHeight / 2 - (strength * this.chartHeight / 2);
  }

  /**
   * 渲染错误信息
   * @param message 错误信息
   */
  private renderError(message: string): void {
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
