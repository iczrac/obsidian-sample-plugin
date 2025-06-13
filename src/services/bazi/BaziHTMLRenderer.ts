import { BaziUtils } from './BaziUtils';
import { BaziInfo } from '../../types/BaziInfo';

/**
 * 八字HTML渲染模块
 * 专门处理八字信息的HTML生成和样式渲染
 */
export class BaziHTMLRenderer {
  /**
   * 生成八字信息的HTML
   * @param baziInfo 八字信息对象
   * @returns HTML字符串
   */
  static generateBaziHTML(baziInfo: any): string {
    if (!baziInfo) {
      return '<div class="bazi-error">八字信息不完整</div>';
    }

    const html = `
      <div class="bazi-container">
        <div class="bazi-header">
          <h3>八字命盘</h3>
          ${baziInfo.birthDate ? `<div class="birth-info">出生时间：${baziInfo.birthDate}</div>` : ''}
          ${baziInfo.gender ? `<div class="gender-info">性别：${baziInfo.gender === '1' ? '男' : '女'}</div>` : ''}
        </div>
        
        <div class="bazi-pillars">
          <div class="pillar-labels">
            <div class="label">年柱</div>
            <div class="label">月柱</div>
            <div class="label">日柱</div>
            <div class="label">时柱</div>
          </div>
          
          <div class="pillar-stems">
            <div class="stem ${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem || ''}</div>
            <div class="stem ${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem || ''}</div>
            <div class="stem ${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem || ''}</div>
            <div class="stem ${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem || ''}</div>
          </div>
          
          <div class="pillar-branches">
            <div class="branch">${baziInfo.yearBranch || ''}</div>
            <div class="branch">${baziInfo.monthBranch || ''}</div>
            <div class="branch">${baziInfo.dayBranch || ''}</div>
            <div class="branch">${baziInfo.hourBranch || ''}</div>
          </div>
          
          <div class="pillar-shengxiao">
            <div class="shengxiao">${baziInfo.yearShengXiao || ''}</div>
            <div class="shengxiao">${baziInfo.monthShengXiao || ''}</div>
            <div class="shengxiao">${baziInfo.dayShengXiao || ''}</div>
            <div class="shengxiao">${baziInfo.hourShengXiao || ''}</div>
          </div>
        </div>
        
        ${this.generateAdditionalInfo(baziInfo)}
        ${this.generateDaYunInfo(baziInfo)}
        ${this.generateShenShaInfo(baziInfo)}
      </div>
    `;

    return html;
  }

  /**
   * 生成附加信息HTML
   * @param baziInfo 八字信息
   * @returns HTML字符串
   */
  private static generateAdditionalInfo(baziInfo: any): string {
    if (!baziInfo.taiYuan && !baziInfo.mingGong) {
      return '';
    }

    return `
      <div class="bazi-additional">
        <h4>附加信息</h4>
        <div class="additional-grid">
          ${baziInfo.taiYuan ? `<div class="info-item"><span class="label">胎元：</span><span class="value">${baziInfo.taiYuan}</span></div>` : ''}
          ${baziInfo.mingGong ? `<div class="info-item"><span class="label">命宫：</span><span class="value">${baziInfo.mingGong}</span></div>` : ''}
          ${baziInfo.sanHeJu ? `<div class="info-item"><span class="label">三合局：</span><span class="value">${baziInfo.sanHeJu}</span></div>` : ''}
          ${baziInfo.sanHuiJu ? `<div class="info-item"><span class="label">三会局：</span><span class="value">${baziInfo.sanHuiJu}</span></div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * 生成大运信息HTML
   * @param baziInfo 八字信息
   * @returns HTML字符串
   */
  private static generateDaYunInfo(baziInfo: any): string {
    if (!baziInfo.daYun || !Array.isArray(baziInfo.daYun) || baziInfo.daYun.length === 0) {
      return '';
    }

    const daYunHTML = baziInfo.daYun.slice(0, 8).map((dy: any, index: number) => `
      <div class="dayun-item">
        <div class="dayun-age">${dy.startAge || index * 10}岁</div>
        <div class="dayun-ganzi">${dy.ganZhi || ''}</div>
        <div class="dayun-nayin">${dy.naYin || ''}</div>
      </div>
    `).join('');

    return `
      <div class="bazi-dayun">
        <h4>大运</h4>
        <div class="dayun-container">
          ${daYunHTML}
        </div>
      </div>
    `;
  }

  /**
   * 生成神煞信息HTML
   * @param baziInfo 八字信息
   * @returns HTML字符串
   */
  private static generateShenShaInfo(baziInfo: any): string {
    if (!baziInfo.shenSha || !Array.isArray(baziInfo.shenSha) || baziInfo.shenSha.length === 0) {
      return '';
    }

    const shenShaHTML = baziInfo.shenSha.map((sha: string) => `
      <span class="shensha-item">${sha}</span>
    `).join('');

    return `
      <div class="bazi-shensha">
        <h4>神煞</h4>
        <div class="shensha-container">
          ${shenShaHTML}
        </div>
      </div>
    `;
  }

  /**
   * 获取五行对应的CSS类名
   * @param wuxing 五行名称
   * @returns CSS类名
   */
  private static getWuXingClass(wuxing: string): string {
    return BaziUtils.getWuXingClass(wuxing);
  }

  /**
   * 生成简化的八字HTML（用于代码块）
   * @param baziInfo 八字信息
   * @returns 简化的HTML字符串
   */
  static generateSimpleBaziHTML(baziInfo: any): string {
    if (!baziInfo) {
      return '<div class="bazi-error">八字信息不完整</div>';
    }

    return `
      <div class="bazi-simple">
        <div class="bazi-pillars-simple">
          <div class="pillar">
            <div class="stem ${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem || ''}</div>
            <div class="branch">${baziInfo.yearBranch || ''}</div>
            <div class="label">年</div>
          </div>
          <div class="pillar">
            <div class="stem ${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem || ''}</div>
            <div class="branch">${baziInfo.monthBranch || ''}</div>
            <div class="label">月</div>
          </div>
          <div class="pillar">
            <div class="stem ${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem || ''}</div>
            <div class="branch">${baziInfo.dayBranch || ''}</div>
            <div class="label">日</div>
          </div>
          <div class="pillar">
            <div class="stem ${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem || ''}</div>
            <div class="branch">${baziInfo.hourBranch || ''}</div>
            <div class="label">时</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 生成八字表格HTML
   * @param baziInfo 八字信息
   * @returns 表格HTML字符串
   */
  static generateBaziTable(baziInfo: any): string {
    if (!baziInfo) {
      return '<div class="bazi-error">八字信息不完整</div>';
    }

    return `
      <table class="bazi-table">
        <thead>
          <tr>
            <th>柱位</th>
            <th>天干</th>
            <th>地支</th>
            <th>纳音</th>
            <th>生肖</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>年柱</td>
            <td class="${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem || ''}</td>
            <td>${baziInfo.yearBranch || ''}</td>
            <td>${baziInfo.yearNaYin || ''}</td>
            <td>${baziInfo.yearShengXiao || ''}</td>
          </tr>
          <tr>
            <td>月柱</td>
            <td class="${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem || ''}</td>
            <td>${baziInfo.monthBranch || ''}</td>
            <td>${baziInfo.monthNaYin || ''}</td>
            <td>${baziInfo.monthShengXiao || ''}</td>
          </tr>
          <tr>
            <td>日柱</td>
            <td class="${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem || ''}</td>
            <td>${baziInfo.dayBranch || ''}</td>
            <td>${baziInfo.dayNaYin || ''}</td>
            <td>${baziInfo.dayShengXiao || ''}</td>
          </tr>
          <tr>
            <td>时柱</td>
            <td class="${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem || ''}</td>
            <td>${baziInfo.hourBranch || ''}</td>
            <td>${baziInfo.hourNaYin || ''}</td>
            <td>${baziInfo.hourShengXiao || ''}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  /**
   * 生成CSS样式
   * @returns CSS样式字符串
   */
  static generateCSS(): string {
    return `
      .bazi-container {
        font-family: Arial, sans-serif;
        margin: 10px 0;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
      }
      
      .bazi-header h3 {
        margin: 0 0 10px 0;
        color: #333;
      }
      
      .bazi-pillars {
        display: grid;
        grid-template-rows: auto auto auto auto;
        gap: 5px;
        margin: 15px 0;
      }
      
      .pillar-labels, .pillar-stems, .pillar-branches, .pillar-shengxiao {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        text-align: center;
      }
      
      .stem, .branch, .label, .shengxiao {
        padding: 8px;
        border-radius: 4px;
        font-weight: bold;
      }
      
      .stem.jin { background-color: #ffd700; color: #333; }
      .stem.mu { background-color: #90ee90; color: #333; }
      .stem.shui { background-color: #87ceeb; color: #333; }
      .stem.huo { background-color: #ff6347; color: white; }
      .stem.tu { background-color: #daa520; color: white; }
      
      .branch { background-color: #e6e6e6; }
      .label { background-color: #333; color: white; }
      .shengxiao { background-color: #f0f0f0; }
    `;
  }
}
