# From Zero (`/from-zero`) 交互式项目教程 Skill 规则

你已挂载 **`from-zero`** 技能（`skills/from-zero/SKILL.md`），可将任何中小型项目、GitHub 仓库或项目描述转化为具有 **Anthropic Claude 人文书卷美学风格** 的**免编译、零依赖单文件交互式 HTML 教程网页**。

## 1. 统一斜杠指令入口 (`/from-zero`)
- 当用户输入 **`/from-zero`** 或要求生成“从零构建 / 从零理解”项目的交互式教程时，立即读取并遵循 `skills/from-zero/SKILL.md`。
- 以 `skills/from-zero/templates/tutorial-shell.html` 作为最小视觉与交互基座（含多语言词法高亮、代码↔注解双向点击联动、ScrollSpy 与行内术语 `.term-chip`），按需加载 `skills/from-zero/references/` 下的分析与原语规范，在 `<main>` 中自由编写项目专属的语义化 HTML、内联 SVG 与原生可操作微沙盘。

## 2. 核心交付与教学契约
- **纯项目驱动 × 教学深度兼备**：
  - 所有概念、术语、底层因果推演、完整流程闭环与代码注解必须 100% 从当前给定项目的真实源码/需求中“长出来”；**主线必懂知识直接展开在正文**，`.deep-dive` 仅放底层深挖与语法补充，严禁为了省篇幅阉割项目核心特性。
  - **严禁新老模板化**：不预设固定章数（随项目复杂度自然生长）、不预设固定几段式卡片或步骤模板，同一教程内连续环节绝不重复同一种布局，严禁“两按钮切换写死字符串”的伪交互。
- **零基础 & Vibe Coder 友好**：
  - 默认采用自然平实的简体中文（**禁止**“人话翻译：”、“直觉比喻：”、“【大白话日常工作】”等机械标签），所有英文缩写、API 方法与抽象概念必须就近用白话讲透或挂上 `.term-chip`；多条职责分点分行展示。
  - 每个可操作微沙盘顶部必须提供 `.sandbox-guide` 1-2-3 步操作指引，按钮文案完整清晰。
  - 核心代码文件必须配备高密度精准注解（行号与代码块严格对齐）及即时验证方法。
- **脚本安全与门禁校验红线**：
  - 在 `<script>` 内嵌字符串中凡出现 `</` 必须转义为 `<\/`，严防脚本提前闭合。
  - 生成单文件 HTML 后，必须运行 `node skills/from-zero/scripts/verify-tutorial.mjs <目标文件.html>` 通过全部自动化校验。

## 3. 双端自动同步规则（项目仓库 ↔ 全局生效插件）
- 本 Skill 同时维护在项目仓库端（`D:\Antigravity\from_zero\skills\from-zero\`）与全局生效插件端（`C:\Users\30456\.gemini\config\plugins\from-zero\skills\from-zero\`）。
- 修改任一文件后，立即执行：
  `powershell -ExecutionPolicy Bypass -File "D:\Antigravity\from_zero\sync.ps1" -Mode ProjectToGlobal`
