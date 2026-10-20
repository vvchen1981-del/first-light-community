# 初见社区版 · First Light Community

**免费的中英文圣经阅读与艺术学习小站，无需注册。**

读一章经文，停下来看看画，或从一个问题开始。手机和电脑都可以直接打开，无需安装。

**[开始阅读 →](https://vvchen1981-del.github.io/first-light-community/#read/JHN/1)** · [探索 5 个课程](https://vvchen1981-del.github.io/first-light-community/#learn) · [进入艺术画廊](https://vvchen1981-del.github.io/first-light-community/#art)

[English](README.md) · [反馈问题或建议](https://github.com/vvchen1981-del/first-light-community/issues/new/choose)

![初见社区版阅读与艺术界面](docs/preview-desktop.png)

## 可以做什么

- **中英文阅读：**简体新标点和合本与 English World English Bible，每版均有 66 卷、1,189 章。可选择书卷和章节、章内检索、逐节定位、连续阅读并恢复阅读位置。保留来源经节编号和合并节。
- **从画作走进故事：**4 件圣经主题馆藏作品，附背景、观察提示、经文关联、机构原始页面和许可来源。
- **从问题开始学习：**5 个双语入门课程，每课结合经文、背景与理解题，提供反馈和本机完成记录。
- **使用设备朗读：**可按节或连续整章朗读，选择可用音色并调整速度。音色、发音、自然度和联网要求取决于浏览器与操作系统；本版不接入云端 TTS。实际听感仍需在真实设备上试听验证。
- **保存自己的阅读记录：**收藏经文和画作、记录进度、导出或导入 JSON 备份。记录仅保存在当前浏览器，不会自动跨设备同步。

通过语言按钮切换中文和英文。支持手机、桌面、键盘操作与可见焦点。

## 免费使用与隐私

社区版是独立静态网站，不提供账号、订阅、广告或应用内分析，也不需要 API 密钥或后端服务。应用不会上传收藏、偏好和学习进度。托管商可能记录网络请求，部分系统声音可能使用供应商在线服务，详情见[隐私说明](PRIVACY.md)。可在“我的”中清除本机记录；清理浏览器数据前请先导出备份，备份文件请自行保管。

本版不承诺离线安装。首次访问和未缓存的经文需要联网；下载源代码后可在本机启动阅读，但设备语音仍可能需要网络。GitHub Pages 的访问情况与加载速度因网络和地区而异。

本版不包含完整原生 iOS 应用、云端语音、附近教堂、开屏影片或完整艺术库。两种经文均为 66 卷版本，不代表所有基督教传统的正典范围。

## 让它更好用

无需 GitHub 账号也能使用网站。若你有账号，欢迎用中文或英文[反馈问题或建议](https://github.com/vvchen1981-del/first-light-community/issues/new/choose)：说明尝试了什么、发生了什么，以及设备和浏览器。按钮难找、译文别扭、声音不可用，都值得反馈。

也可以直接把[阅读入口](https://vvchen1981-del.github.io/first-light-community/#read/JHN/1)、[课程](https://vvchen1981-del.github.io/first-light-community/#learn)或[画廊](https://vvchen1981-del.github.io/first-light-community/#art)分享给朋友。想方便以后找到项目，可以选择点 Star；使用网站没有这个要求。

贡献翻译、来源核对、无障碍反馈或代码，请先看[贡献指南](CONTRIBUTING.md)。不要把个人备份、私密阅读笔记、密码或密钥放进公开问题或代码提交。

## 本机启动

安装 Node.js 22 或更新版本，在本目录运行：

```sh
npm start
```

打开 **http://127.0.0.1:4340/**。无需 `npm install`，项目没有 npm 依赖。Windows 用户也可双击 `START.cmd`。请通过本机服务器访问，不要直接双击 `index.html`。

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

构建仅将明确允许的公开文件复制到 `dist/`；可用 `PORT` 环境变量修改端口。[验证记录](docs/VALIDATION.md)说明了检查范围和限制，自动检查通过不等于实际语音听感已验收。

如需部署自己的副本，请参考[英文 README 的部署步骤](README.md#deploy-your-own-copy)。只上传社区版目录，不要包含父级工作区、其他版本、私人环境文件或备份。

## 来源和许可

新增应用代码与原创短篇导读采用 [MIT 许可](LICENSE)。经文、图片和字体分别保留其原有条款，不因代码许可而改为 MIT。详见[第三方资源说明](THIRD_PARTY_NOTICES.md)，包含经文出版来源、博物馆藏品页面、图像权利和字体许可。

4 件图像均注明美国国家美术馆（National Gallery of Art, Washington）来源。导读区分经文、历史背景和编辑观察提示；任何机构均未为本应用背书。

## 1.1.0 朗读验证

已在 Windows Chrome 中验证中英文真实设备语音的出声、暂停/恢复、连续经节、切换页面停止及重新播放，并通过系统输出回环确认有声与静音。其他浏览器、手机设备及音色自然度仍需各自验证；详情见[验证记录](docs/VALIDATION.md)。
