# 八字命盘 Obsidian 插件

基于 lunar-typescript 的专业八字命盘插件，为 Obsidian 用户提供完整的八字分析功能。

## ✨ 主要功能

- **八字计算** - 支持公历/农历日期输入，自动计算四柱八字
- **多种显示样式** - 简单、标准、完整三种显示模式
- **神煞分析** - 支持30种传统神煞的计算与显示
- **大运流年** - 完整的大运、流年、流月分析
- **五行分析** - 详细的五行强度计算与可视化
- **格局判断** - 智能的八字格局识别与分析
- **交互式界面** - 现代化的用户界面，支持点击交互

## 🚀 快速开始

### 安装方法

1. **手动安装**
   - 下载最新版本的 `main.js`、`manifest.json` 和 `styles.css`
   - 复制到你的 vault 目录：`VaultFolder/.obsidian/plugins/bazi-obsidian/`
   - 在 Obsidian 设置中启用插件

2. **开发安装**
   - 克隆此仓库到 `.obsidian/plugins/bazi-obsidian/`
   - 运行 `npm install` 安装依赖
   - 运行 `npm run dev` 开始开发模式
   - 在 Obsidian 中启用插件

### 使用方法

1. **创建八字代码块**
   ```markdown
   ```bazi
   date: 1990-01-01 08:00
   gender: 男
   ```

2. **支持的参数**
   - `date`: 公历日期时间
   - `lunar`: 农历日期
   - `bazi`: 直接输入八字
   - `gender`: 性别（男/女）
   - `style`: 显示样式（1-简单，2-标准，3-完整）
   - `year`: 指定年份（用于八字反推）

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint .\src\`

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
    "fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
    "fundingUrl": {
        "Buy Me a Coffee": "https://buymeacoffee.com",
        "GitHub Sponsor": "https://github.com/sponsors",
        "Patreon": "https://www.patreon.com/"
    }
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
