/**
 * 扩展列类型枚举
 */
export enum ExtendedColumnType {
	NONE = 'none',                    // 不自动扩展
	AUTO_CURRENT = 'auto_current',    // 自动扩展到当前流时（动态更新）
	AUTO_DAY = 'auto_day',           // 自动扩展到流日
	AUTO_MONTH = 'auto_month',       // 自动扩展到流月
	SPECIAL_PALACES = 'special_palaces', // 扩展胎元命宫身宫3列
	CUSTOM = 'custom'                // 自定义扩展（保留现有手动扩展功能）
}

/**
 * 八字代码块参数接口
 */
export interface BaziParams {
	// 基本参数
	date?: string;           // 公历日期
	lunar?: string;          // 农历日期
	bazi?: string;           // 八字
	now?: string;            // 是否使用当前时间
	gender?: string;         // 性别
	name?: string;           // 姓名
	year?: string;           // 年份（用于纯八字模式）
	leap?: string;           // 是否闰月（用于农历日期）

	// 显示选项
	title?: string;          // 标题
	theme?: string;          // 主题
	showWuxing?: string;     // 是否显示五行
	showSpecialInfo?: string; // 是否显示特殊信息
	calculationMethod?: string; // 计算方法

	// 扩展列控制（完整参数）
	extend?: string;         // 扩展列类型：none|auto_current|auto_day|auto_month|special_palaces|custom
	extendCount?: string;    // 扩展列数量（用于custom模式）
	extendTarget?: string;   // 扩展目标时间（用于custom模式，格式：YYYY-MM-DD HH:mm）

	// 扩展列控制（简洁参数）
	ex?: string;             // extend 的简洁版本
	to?: string;             // extendTarget 的简洁版本
	count?: string;          // extendCount 的简洁版本

	// 更简洁的单字母参数
	e?: string;              // extend 的单字母版本
	t?: string;              // extendTarget 的单字母版本
	c?: string;              // extendCount 的单字母版本

	// 神煞显示设置
	showshensha_sizhu?: string;   // 是否显示四柱神煞
	showshensha_dayun?: string;   // 是否显示大运神煞
	showshensha_liunian?: string; // 是否显示流年神煞
	showshensha_xiaoyun?: string; // 是否显示小运神煞
	showshensha_liuyue?: string;  // 是否显示流月神煞

	// 其他可能的参数
	[key: string]: string | undefined;
}

/**
 * 八字显示样式枚举
 */
export enum BaziDisplayStyle {
	SIMPLE = 'simple',     // 样式1：简洁八字样式
	STANDARD = 'standard', // 样式2：标准分析样式
	COMPLETE = 'complete'  // 样式3：完整专业样式
}

/**
 * 插件设置接口
 */
export interface BaziPluginSettings {
	defaultDisplayStyle: BaziDisplayStyle; // 默认显示样式
	debugMode: boolean;
	autoUpdateCodeBlock: boolean;
	codeBlockUpdateDelay: number;
	baziSect: string; // 八字流派
	qiYunSect: number; // 起运流派：1为流派1，2为流派2
	showShenSha: {
		siZhu: boolean; // 四柱神煞
		daYun: boolean; // 大运神煞
		liuNian: boolean; // 流年神煞
		xiaoYun: boolean; // 小运神煞
		liuYue: boolean; // 流月神煞
	};
}
