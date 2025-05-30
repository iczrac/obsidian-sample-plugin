/**
 * 双链和标签设置管理
 * 支持全局设置和单个八字的独立设置
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import BaziPlugin from '../main';
import { DoubleLinkTagConfig, DEFAULT_DOUBLELINK_TAG_CONFIG } from './DoubleLinkTagConfig';

/**
 * 设置层级枚举
 */
export enum ConfigLevel {
    DEFAULT = 'default',    // 默认配置
    GLOBAL = 'global',      // 全局用户配置
    INDIVIDUAL = 'individual' // 单个八字配置
}

/**
 * 双链标签设置接口
 */
export interface DoubleLinkTagSettings {
    // 全局开关
    globalEnabled: boolean;

    // 全局配置
    globalConfig: DoubleLinkTagConfig;

    // 单个八字配置存储
    individualConfigs: {
        [baziId: string]: {
            enabled: boolean;
            config: Partial<DoubleLinkTagConfig>;
            lastModified: number;
        };
    };

    // 高级设置
    advanced: {
        autoSuggest: boolean;           // 自动建议
        smartDetection: boolean;        // 智能检测
        showConfigButton: boolean;      // 显示配置按钮
        enableBatchOperations: boolean; // 启用批量操作
    };
}

/**
 * 默认设置
 */
export const DEFAULT_DOUBLELINK_TAG_SETTINGS: DoubleLinkTagSettings = {
    globalEnabled: true,
    globalConfig: DEFAULT_DOUBLELINK_TAG_CONFIG,
    individualConfigs: {},
    advanced: {
        autoSuggest: true,
        smartDetection: true,
        showConfigButton: true,
        enableBatchOperations: false
    }
};

/**
 * 设置管理器
 */
export class DoubleLinkTagSettingsManager {
    private plugin: BaziPlugin;
    private settings: DoubleLinkTagSettings;

    constructor(plugin: BaziPlugin) {
        this.plugin = plugin;
        this.settings = DEFAULT_DOUBLELINK_TAG_SETTINGS;
    }

    /**
     * 加载设置
     */
    async loadSettings(): Promise<void> {
        try {
            const data = await this.plugin.loadData();
            const savedSettings = data?.doubleLinkTagSettings || {};

            // 深度合并配置，确保默认配置不被覆盖
            this.settings = this.deepMergeSettings(DEFAULT_DOUBLELINK_TAG_SETTINGS, savedSettings);

            console.log('🔗 双链标签设置加载完成:', {
                globalEnabled: this.settings.globalEnabled,
                locationFields: this.settings.globalConfig.doubleLinks.location.fields.length,
                booksFields: this.settings.globalConfig.doubleLinks.books.fields.length,
                shenShaFields: this.settings.globalConfig.doubleLinks.shenSha.fields.length,
                patternFields: this.settings.globalConfig.doubleLinks.pattern.fields.length
            });
        } catch (error) {
            console.error('❌ 双链标签设置加载失败:', error);
            // 使用默认设置
            this.settings = JSON.parse(JSON.stringify(DEFAULT_DOUBLELINK_TAG_SETTINGS));
            console.log('🔄 已使用默认配置');
        }
    }

    /**
     * 深度合并设置
     */
    private deepMergeSettings(defaultSettings: DoubleLinkTagSettings, savedSettings: any): DoubleLinkTagSettings {
        const result = JSON.parse(JSON.stringify(defaultSettings)); // 深拷贝默认设置

        // 合并基本设置
        if (savedSettings.globalEnabled !== undefined) {
            result.globalEnabled = savedSettings.globalEnabled;
        }

        if (savedSettings.individualConfigs) {
            result.individualConfigs = savedSettings.individualConfigs;
        }

        if (savedSettings.advanced) {
            result.advanced = { ...result.advanced, ...savedSettings.advanced };
        }

        // 如果有保存的globalConfig，进行完整合并
        if (savedSettings.globalConfig) {
            // 合并基础设置
            if (savedSettings.globalConfig.autoSuggest !== undefined) {
                result.globalConfig.autoSuggest = savedSettings.globalConfig.autoSuggest;
            }
            if (savedSettings.globalConfig.smartDetection !== undefined) {
                result.globalConfig.smartDetection = savedSettings.globalConfig.smartDetection;
            }
            if (savedSettings.globalConfig.showConfigButton !== undefined) {
                result.globalConfig.showConfigButton = savedSettings.globalConfig.showConfigButton;
            }

            // 合并双链配置（包括字段和启用状态）
            if (savedSettings.globalConfig.doubleLinks) {
                Object.keys(result.globalConfig.doubleLinks).forEach(key => {
                    const savedCategory = savedSettings.globalConfig.doubleLinks[key];
                    if (savedCategory) {
                        // 合并启用状态
                        if (savedCategory.enabled !== undefined) {
                            result.globalConfig.doubleLinks[key].enabled = savedCategory.enabled;
                        }
                        // 合并字段（如果有保存的字段，使用保存的；否则保持默认）
                        if (savedCategory.fields && Array.isArray(savedCategory.fields)) {
                            result.globalConfig.doubleLinks[key].fields = savedCategory.fields;
                        }
                    }
                });

                // 处理旧的person配置 - 迁移到职业标签
                if (savedSettings.globalConfig.doubleLinks.person) {
                    const personConfig = savedSettings.globalConfig.doubleLinks.person;
                    if (personConfig.fields && Array.isArray(personConfig.fields)) {
                        // 过滤掉通用字段，保留职业相关字段
                        const professionFields = personConfig.fields.filter((field: string) =>
                            !['人名', '姓名', 'name'].includes(field)
                        );
                        if (professionFields.length > 0) {
                            // 合并到职业标签
                            const existingFields = result.globalConfig.tags.profession.fields;
                            result.globalConfig.tags.profession.fields = [
                                ...existingFields,
                                ...professionFields.filter((field: string) => !existingFields.includes(field))
                            ];
                        }
                    }
                    console.log('🔄 已迁移旧的person配置到职业标签');
                }
            }

            // 合并标签配置（包括字段和启用状态）
            if (savedSettings.globalConfig.tags) {
                Object.keys(result.globalConfig.tags).forEach(key => {
                    const savedCategory = savedSettings.globalConfig.tags[key];
                    if (savedCategory) {
                        // 合并启用状态
                        if (savedCategory.enabled !== undefined) {
                            result.globalConfig.tags[key].enabled = savedCategory.enabled;
                        }
                        // 合并字段（如果有保存的字段，使用保存的；否则保持默认）
                        if (savedCategory.fields && Array.isArray(savedCategory.fields)) {
                            result.globalConfig.tags[key].fields = savedCategory.fields;
                        }
                    }
                });

                // 处理旧的pattern标签配置 - 迁移到双链
                if (savedSettings.globalConfig.tags.pattern) {
                    const patternConfig = savedSettings.globalConfig.tags.pattern;
                    if (patternConfig.enabled !== undefined) {
                        result.globalConfig.doubleLinks.pattern.enabled = patternConfig.enabled;
                    }
                    if (patternConfig.fields && Array.isArray(patternConfig.fields)) {
                        // 合并到双链pattern字段
                        const existingFields = result.globalConfig.doubleLinks.pattern.fields;
                        result.globalConfig.doubleLinks.pattern.fields = [
                            ...existingFields,
                            ...patternConfig.fields.filter((field: string) => !existingFields.includes(field))
                        ];
                    }
                    console.log('🔄 已迁移旧的pattern标签配置到双链');
                }
            }

            // 合并混合配置
            if (savedSettings.globalConfig.hybrid) {
                result.globalConfig.hybrid = { ...result.globalConfig.hybrid, ...savedSettings.globalConfig.hybrid };
            }
        }

        console.log('🔧 配置合并完成:', {
            globalEnabled: result.globalEnabled,
            locationFields: result.globalConfig.doubleLinks.location.fields.length,
            booksFields: result.globalConfig.doubleLinks.books.fields.length,
            shenShaFields: result.globalConfig.doubleLinks.shenSha.fields.length,
            patternFields: result.globalConfig.doubleLinks.pattern.fields.length
        });

        return result;
    }

    /**
     * 保存设置
     */
    async saveSettings(): Promise<void> {
        console.log('💾 开始保存双链标签设置:', {
            locationFields: this.settings.globalConfig.doubleLinks.location.fields.length,
            booksFields: this.settings.globalConfig.doubleLinks.books.fields.length,
            shenShaFields: this.settings.globalConfig.doubleLinks.shenSha.fields.length,
            patternFields: this.settings.globalConfig.doubleLinks.pattern.fields.length
        });

        const data = await this.plugin.loadData() || {};
        data.doubleLinkTagSettings = this.settings;
        await this.plugin.saveData(data);

        console.log('✅ 双链标签设置保存完成');
    }

    /**
     * 获取有效配置（考虑优先级）
     */
    getEffectiveConfig(baziId?: string): DoubleLinkTagConfig {
        // 如果全局未启用，返回空配置
        if (!this.settings.globalEnabled) {
            return this.createEmptyConfig();
        }

        // 从全局配置开始
        let effectiveConfig = { ...this.settings.globalConfig };

        // 如果有单个八字配置，进行合并
        if (baziId && this.settings.individualConfigs[baziId]) {
            const individualSetting = this.settings.individualConfigs[baziId];

            // 如果单个八字配置被禁用，返回空配置
            if (!individualSetting.enabled) {
                return this.createEmptyConfig();
            }

            // 合并配置
            effectiveConfig = this.mergeConfigs(effectiveConfig, individualSetting.config);
        }

        return effectiveConfig;
    }

    /**
     * 设置单个八字配置
     */
    setIndividualConfig(baziId: string, enabled: boolean, config?: Partial<DoubleLinkTagConfig>): void {
        this.settings.individualConfigs[baziId] = {
            enabled,
            config: config || {},
            lastModified: Date.now()
        };
    }

    /**
     * 获取单个八字配置
     */
    getIndividualConfig(baziId: string): { enabled: boolean; config: Partial<DoubleLinkTagConfig> } | null {
        const setting = this.settings.individualConfigs[baziId];
        return setting ? { enabled: setting.enabled, config: setting.config } : null;
    }

    /**
     * 删除单个八字配置
     */
    removeIndividualConfig(baziId: string): void {
        delete this.settings.individualConfigs[baziId];
    }

    /**
     * 获取全局设置
     */
    getGlobalSettings(): DoubleLinkTagSettings {
        return this.settings; // 返回原始引用，允许直接修改
    }

    /**
     * 更新全局配置
     */
    updateGlobalConfig(config: Partial<DoubleLinkTagConfig>): void {
        this.settings.globalConfig = this.mergeConfigs(this.settings.globalConfig, config);
    }

    /**
     * 设置全局开关
     */
    setGlobalEnabled(enabled: boolean): void {
        this.settings.globalEnabled = enabled;
    }

    /**
     * 更新高级设置
     */
    updateAdvancedSettings(advanced: Partial<DoubleLinkTagSettings['advanced']>): void {
        this.settings.advanced = { ...this.settings.advanced, ...advanced };
    }

    /**
     * 创建空配置
     */
    private createEmptyConfig(): DoubleLinkTagConfig {
        return {
            autoSuggest: false,
            smartDetection: false,
            showConfigButton: false,
            doubleLinks: {
                shenSha: { enabled: false, fields: [] },
                pattern: { enabled: false, fields: [] },
                location: { enabled: false, fields: [] },
                books: { enabled: false, fields: [] },
                custom: { enabled: false, fields: [] }
            },
            tags: {
                profession: { enabled: false, fields: [] },
                personality: { enabled: false, fields: [] },
                wuxingStrength: { enabled: false, fields: [] },
                era: { enabled: false, fields: [] },
            relations: { enabled: false, fields: [] },
                custom: { enabled: false, fields: [] }
            },
            hybrid: { flexibleFields: [] }
        };
    }

    /**
     * 合并配置
     */
    private mergeConfigs(base: DoubleLinkTagConfig, override: Partial<DoubleLinkTagConfig>): DoubleLinkTagConfig {
        const result = JSON.parse(JSON.stringify(base)); // 深拷贝

        if (override.doubleLinks) {
            Object.keys(override.doubleLinks).forEach(key => {
                if (override.doubleLinks![key as keyof typeof override.doubleLinks]) {
                    result.doubleLinks[key as keyof typeof result.doubleLinks] = {
                        ...result.doubleLinks[key as keyof typeof result.doubleLinks],
                        ...override.doubleLinks![key as keyof typeof override.doubleLinks]
                    };
                }
            });
        }

        if (override.tags) {
            Object.keys(override.tags).forEach(key => {
                if (override.tags![key as keyof typeof override.tags]) {
                    result.tags[key as keyof typeof result.tags] = {
                        ...result.tags[key as keyof typeof result.tags],
                        ...override.tags![key as keyof typeof override.tags]
                    };
                }
            });
        }

        if (override.hybrid) {
            result.hybrid = { ...result.hybrid, ...override.hybrid };
        }

        return result;
    }

    /**
     * 生成八字ID
     */
    generateBaziId(baziInfo: any): string {
        // 基于八字信息生成唯一ID
        const key = `${baziInfo.solarDate || 'unknown'}_${baziInfo.gender || 'unknown'}_${baziInfo.name || 'unnamed'}`;

        // 使用更安全的编码方式，避免中文字符问题
        try {
            // 先转换为UTF-8字节，再进行base64编码
            const encoder = new TextEncoder();
            const data = encoder.encode(key);
            const base64 = btoa(String.fromCharCode(...data));
            return base64.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        } catch (error) {
            // 如果编码失败，使用简单的哈希方法
            let hash = 0;
            for (let i = 0; i < key.length; i++) {
                const char = key.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 转换为32位整数
            }
            return Math.abs(hash).toString(36).substring(0, 16);
        }
    }

    /**
     * 清理过期的单个配置
     */
    cleanupExpiredConfigs(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
        const now = Date.now();
        Object.keys(this.settings.individualConfigs).forEach(baziId => {
            const config = this.settings.individualConfigs[baziId];
            if (now - config.lastModified > maxAge) {
                delete this.settings.individualConfigs[baziId];
            }
        });
    }

    /**
     * 导出配置
     */
    exportConfig(): string {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * 导入配置
     */
    importConfig(configJson: string): boolean {
        try {
            const imported = JSON.parse(configJson);
            this.settings = Object.assign({}, DEFAULT_DOUBLELINK_TAG_SETTINGS, imported);
            return true;
        } catch (error) {
            console.error('导入配置失败:', error);
            return false;
        }
    }

    /**
     * 重置为默认配置
     */
    resetToDefault(): void {
        this.settings = JSON.parse(JSON.stringify(DEFAULT_DOUBLELINK_TAG_SETTINGS));
    }

    /**
     * 获取统计信息
     */
    getStatistics(): {
        totalIndividualConfigs: number;
        enabledIndividualConfigs: number;
        totalCustomFields: number;
        lastModified: number;
    } {
        const individualConfigs = Object.values(this.settings.individualConfigs);
        const enabledConfigs = individualConfigs.filter(config => config.enabled);

        let totalCustomFields = 0;
        totalCustomFields += this.settings.globalConfig.doubleLinks.custom.fields.length;
        totalCustomFields += this.settings.globalConfig.tags.custom.fields.length;

        const lastModified = Math.max(
            ...individualConfigs.map(config => config.lastModified),
            0
        );

        return {
            totalIndividualConfigs: individualConfigs.length,
            enabledIndividualConfigs: enabledConfigs.length,
            totalCustomFields,
            lastModified
        };
    }
}
