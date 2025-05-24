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
	year?: string;           // 年份（用于纯八字模式）
	leap?: string;           // 是否闰月（用于农历日期）

	// 显示选项
	title?: string;          // 标题
	theme?: string;          // 主题
	showWuxing?: string;     // 是否显示五行
	showSpecialInfo?: string; // 是否显示特殊信息
	calculationMethod?: string; // 计算方法

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
 * 插件设置接口
 */
export interface BaziPluginSettings {
	debugMode: boolean;
	autoUpdateCodeBlock: boolean;
	codeBlockUpdateDelay: number;
	baziSect: string; // 八字流派
	showShenSha: {
		siZhu: boolean; // 四柱神煞
		daYun: boolean; // 大运神煞
		liuNian: boolean; // 流年神煞
		xiaoYun: boolean; // 小运神煞
		liuYue: boolean; // 流月神煞
	};
}
