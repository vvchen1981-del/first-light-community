# Contributing / 参与贡献

Thank you for helping make First Light easier to read and use. Feedback in **English or Chinese** is welcome. You do not need to write code to contribute.

欢迎用中文或英文反馈体验、修正文案、核对来源或提交代码；不需要会编程。

## Start with the smallest useful contribution

- Try a passage, a lesson, or an artwork on your own device. Report what felt confusing or failed.
- Suggest a clearer translation or accessible label, quoting only the relevant public interface text.
- Check an artwork's attribution or source link and provide an institutional reference.
- Share the live site with someone who may find it useful. Stars are optional.

Use [the issue forms](https://github.com/vvchen1981-del/first-light-community/issues/new/choose) for bugs, speech reports, suggestions, or content corrections. Please search existing issues first. GitHub requires an account to post; reading the site does not.

反馈时请说明页面、操作、预期和实际结果；语音问题请附设备、系统、浏览器、语言和音色名称。公开问题中不要包含私人笔记、个人备份、密码、API 密钥或令牌。截图前请遮去个人信息。

## Content and source standards

Preserve scripture exactly as supplied by its publisher, including verse numbering and verse bridges. For a suspected scripture error, cite the edition, book, chapter, verse, and publisher source. Do not silently rewrite verses or translate another edition to fill a gap.

For art and learning content, distinguish biblical text, historical facts, and editorial interpretation. Link factual corrections to a reliable primary source. Any proposed artwork needs an institutional object page, attribution, image rights statement, and compatible reuse terms. Do not copy museum prose or introduce an image with unclear rights. Keep the existing license and third-party notices intact.

经文问题需附版本、卷章节与出版来源；艺术内容需区分事实与编辑观察，并提供机构来源及图像许可。中文和英文都应自然易懂，避免没有依据的效果、用户规模或机构背书说法。

## Propose a change

For a small fix, open a focused pull request explaining the problem and resulting behavior. For a new feature or substantial content addition, open an issue first so its scope and source requirements can be discussed before you invest time.

1. Fork the repository and create a branch for one change.
2. Use Node.js 22 or newer. Run `npm start` and open `http://127.0.0.1:4340/`. There is no dependency installation step.
3. Keep the application static and dependency-free. Never add service secrets, accounts, paid APIs, tracking, or cloud services as an incidental change.
4. For code or data changes, run `npm test` and `npm run build`. If adding public assets, inspect the explicit build allowlist so the built app includes only intended files.
5. For interface changes, exercise the affected flow in both languages on a narrow mobile viewport and desktop. Check keyboard navigation and focus. For speech changes, listen in an ordinary browser on the stated device; report any unavailable voices or untested devices.
6. Open a pull request with a short description, relevant issue link, checks performed, and any limits. Add screenshots for visual changes, without personal data.

Documentation-only changes need a review of links and factual consistency; do not claim device or browser testing you did not perform. A passing build or mocked speech call does not prove that audio was heard or that its quality is acceptable.

## Respectful feedback

Describe the behavior or claim you want to improve and give concrete evidence where possible. People may approach these texts from different religious, cultural, or academic backgrounds; keep discussion respectful and avoid personal attacks. Contributions remain subject to review and are not a promise of release or a response deadline.

## License and privacy

New application code and original guide text use the [MIT license](LICENSE). Third-party scripture, artwork, and fonts retain their respective terms in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). By proposing material, identify its source and confirm that you have the right to contribute it under the applicable terms. See [PRIVACY.md](PRIVACY.md) for local storage and device-speech details.
