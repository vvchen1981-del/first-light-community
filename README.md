# First Light Community · 初见社区版

A quiet place to read the Bible, explore its stories through art, and keep what matters.
一个免费的中英文圣经阅读与艺术学习小站。无需注册，打开网页即可使用。

**Independent static edition / 独立静态简版** — no API keys, no backend, no runtime dependencies.
This repository is not the full native iOS app and does not include its cloud speech, accounts or subscriptions.

![Community reading and art interface](docs/preview-desktop.png)

## What is included / 功能

- 中文新标点和合本 + English World English Bible，每个版本 66 卷、1,189 章。按卷按章加载，保留原始经节编号和合并节。
- 旧约/新约及书卷、章节选择，逐节定位、章内检索、连续章节导航、恢复阅读位置。
- 设备语音朗读：按节播放、整章连续朗读、暂停/继续、停止、音色选择与速度调整。音色依赖设备，不能保证与完整版云端声音相同。
- 5 个双语入门学习单元，附原文入口、理解题、反馈与本机完成记录。
- 4 件精选圣经主题馆藏艺术作品，配创作信息、背景、观察提示、经文关联和出处。
- 本地收藏、学习进度、JSON 备份导出/导入；无跨设备自动同步。
- 中英界面切换、手机与桌面布局、键盘操作与可见焦点。

不包含：云端 TTS、付费课程、用户账号、附近教堂服务、200 件完整艺术库、开屏影片、iOS 打包。没有将完整版的付费接口或私有配置移入这个公开项目。
Not included: cloud TTS, subscriptions, accounts, church search, the full art collection, intro films or native iOS packaging.

## Run locally / 本机启动

Install Node.js 22 or newer, then run inside this folder:

```sh
npm start
```

Open **http://127.0.0.1:4340/**. No `npm install` is needed: this project has no npm dependencies.
Do not double-click `index.html`; browsers restrict module/data loading over `file://`.
Windows 用户安装 Node.js 后，也可双击 `START.cmd`，再打开上述网址。

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

The build copies only an explicit public-file allowlist into `dist/`. To choose another port, set the `PORT` environment variable.

## Publish on GitHub Pages / GitHub 上线

1. Create a GitHub repository (for example, `first-light-community`).
2. Upload **this folder's contents**, including `.github/workflows/pages.yml`. Do not upload the parent workspace, personal backups, old full-app folders or private environment files.
3. Use a branch named **main**. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
4. The included workflow runs the data checks and static build, then deploys Pages on pushes to `main`. Pull requests run checks without deployment.
5. Open the actual deployment URL shown by the workflow. A project site normally has the form `https://YOUR-NAME.github.io/first-light-community/`; this is a template, not an already deployed link.

All app resources use relative paths, and reading links use hash routes. Both a root site and a repository subpath are supported. The local development server also supports `/community/` for subpath testing.

GitHub's current workflow guide: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

This delivery does not create a repository or publish a live site automatically. GitHub availability and loading performance vary by network and region.

## Project map

```text
index.html / app.js / styles.css  application
assets/art/                      four attributed open-access images
assets/fonts/                    local font subsets and OFL notices
data/bible/                      complete edition data and provenance
data/art.json                    art metadata and bilingual guide text
data/lessons.json                five learning units
scripts/                         local server and allowlisted build
tests/                           content and public-resource checks
.github/workflows/pages.yml      verify and deploy workflow
```

## Privacy, content, and contributions

Read [PRIVACY.md](PRIVACY.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
New application code and original guide text: [MIT](LICENSE). Scripture, images and fonts retain their respective terms.
Local validation and its limits: [docs/VALIDATION.md](docs/VALIDATION.md). Actual audible device speech still requires ordinary-browser/device listening; headless speech requests failed in the test environment.

Contributors: keep the application static; never add service secrets. Link every new artwork to an institutional object page and image rights statement. Keep original scripture unchanged. Distinguish historical facts, biblical text and editorial observations. Test both languages and narrow mobile screens before proposing changes.

No offline-install/service-worker promise is made in v1. Browser-cached resources may remain available, but a first visit and uncached books require the site. To read without internet, run the downloaded source locally with `npm start`; operating-system speech may still require a network.
