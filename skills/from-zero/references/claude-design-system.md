# Anthropic Claude 人文书卷视觉设计规范

`from-zero` 生成的每一份单文件 HTML 交互式教程，都必须统一呈现 **Anthropic Claude 人文出版物美学**：暖米纸底色、深暖炭墨黑文字、精致衬线标题、克制的 `1px` 细边框、陶土红强调色，以及宽裕的呼吸感。

**视觉统一 ≠ 版式僵化**：颜色、字体与基础控件样式保持全站统一，但正文的章节编排、图表形态与交互实验必须随项目特点自由设计。

**严格禁止的反模式**：
- 严禁霓虹赛博渐变、刺眼高饱和荧光紫背景或厚重黑影（如 `0 20px 50px rgba(0,0,0,0.5)`）。
- 浅色模式下严禁使用纯黑 `#000000` 或刺眼纯白 `#FFFFFF` 作为页面大背景。
- 严禁未加样式的原生丑陋表单控件或大段无呼吸感的纯文本墙。

---

## 1. 色彩系统（精确对应 `templates/tutorial-shell.html`）

所有生成网页的 `:root` 与 `[data-theme="dark"]` 变量必须与 `tutorial-shell.html` 保持一致：

- **浅色模式（默认 — 暖米纸）**：
  - 页面底色 `--bg-primary: #FAF9F5`
  - 卡片表层 `--bg-surface: #FFFFFF`，抬升区 `--bg-elevated: #F6F4EE`，代码区 `--bg-code: #F3F1EB`
  - 主文字 `--text-primary: #1F1E1D`，次文字 `--text-secondary: #5F5D56`，弱文字 `--text-muted: #8E8B82`
  - 细边框 `--border-subtle: #E8E6DF`，强边框 `--border-strong: #D5D2C8`
  - 陶土红强调 `--accent-terracotta: #D97757`（浅底 `--accent-terracotta-soft: #F8EFEA`）
  - 鼠尾草绿（成功/通过）`--accent-sage: #52734D`，暖沙黄（概念/提示）`--accent-sand: #D99B52`，砖红（报错/警示）`--accent-danger: #C24E42`
- **深色模式（暖炭黑，绝不用纯黑）**：
  - 页面底色 `--bg-primary: #191817`，卡片表层 `--bg-surface: #242220`，代码区 `--bg-code: #1E1D1B`
  - 主文字 `--text-primary: #E5E3DE`，次文字 `--text-secondary: #A8A49B`
  - 陶土红强调 `--accent-terracotta: #E08365`

---

## 2. 字体与中英混排排版规范

通过 Google Fonts 加载 `Inter`、`JetBrains Mono`、`Newsreader` 与 `Noto Serif SC`，同时配置覆盖 macOS 与 Windows 的完整本地系统字体回退栈：

- **等宽字体 `--font-mono`**：必须包含 `"JetBrains Mono", "Fira Code", "SF Mono", Consolas, "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", monospace`，避免 Windows 下徽章、`.section-eyebrow` 与 SVG 等宽标签里的中文退化为锯齿宋体。
- **SVG 字体**：基座内置 `svg text { font-family: var(--font-sans); }`，SVG 内中文标签严禁丢失字体声明。
- **行内代码框 `code`**：必须使用相对 `em` 字号与轻量上下内边距（`font-size: 0.84em; padding: 0.05em 0.34em; line-height: 1.2;`），`h1..h4 code` 使用 `0.82em`；严禁使用固定 `rem` 字号和过厚上下边距导致行内代码框撑破紧凑段落上下行。
- **主标题 `<h1>`**：`var(--font-serif)`，`clamp(1.9rem, 3vw, 2.55rem)`，`line-height: 1.24`
- **章节标题 `<h2>`**：`var(--font-serif)`，`clamp(1.4rem, 2.2vw, 1.78rem)`，配合顶部等宽体编号标签 `.section-eyebrow`
- **正文段落 `<p>`**：`var(--font-sans)`，`16px`，`line-height: 1.82`，最大行宽 `74ch`
- **操作按钮文字**：表格或紧凑操作栏内按钮文字须完整清晰（如「切换」「删除」），并用 `white-space: nowrap` 避免折行挤压。

---

## 3. 布局基座与自由画布约定

1. **双栏响应式骨架（由 `tutorial-shell.html` 自动托管）**：
   - 桌面端左侧固定 `276px` 导航栏（`.sidebar`），移动端自动切换为顶部栏 + 滑出式抽屉。
   - **动态目录扫描**：无需手写任何目录 JSON，只需在 `<main id="main-canvas">` 中编写带有 `id`、`data-num` 和 `data-nav` 属性的 `<section class="section-block">`：
     ```html
     <section class="section-block" id="sec-sandbox" data-num="02" data-nav="三环境隔离与消息通道">
       <span class="section-eyebrow">02 / 为什么不能直接调用变量</span>
       <h2>...</h2>
     </section>
     ```
   - 基座会自动生成左侧导航并启用高精度 **ScrollSpy 滚动高亮**，同时自动追踪所有带 `data-step-id` 的复选框并存入 `localStorage`。
2. **微交互与无障碍**：
   - 保留 `@media (prefers-reduced-motion: reduce)` 降级。
   - **离线 `file://` 可用性**：严禁使用 `fetch('./xxx.json')` 或外部 ES Module `<script type="module" src="./...">`，所有数据、SVG 与 JS 必须内联在单文件 HTML 中。
