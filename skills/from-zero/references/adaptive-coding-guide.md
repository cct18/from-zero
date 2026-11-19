# 自适应编码实战与排错指南（反对固定几段式模板）

编写“从零动手实现”章节时，**禁止强制所有步骤套用同一种几段式卡片结构**。应当根据当前文件在项目中的真实性质，灵活决定讲解密度与呈现方式：

---

## 一、按文件性质自适应组织步骤

1. **前置准备（环境与目录生长）**：
   - 明确指出需要什么前置环境（如 Node.js LTS 或仅需现代浏览器），区分 Windows PowerShell 与 macOS/Linux 的常见命令差异，并提醒如果报错“找不到命令”该如何安装。
   - 提醒需要保持本地后台进程运行（如 `npm start`）后再另开浏览器访问，或者如何把文件夹加载进 `chrome://extensions`。
2. **配置与脚手架文件（如 `package.json`、`manifest.json`）**：
   - 篇幅精炼，重点讲清核心字段为什么这样配（如 `"type": "module"`、`permissions`、`host_permissions`），给出完整可复制代码与 1~2 条精准注解及安装/加载验证命令。
3. **核心逻辑与入口文件（如 `db.js`、`server.js`、`content.js`、`background.js`）**：
   - **高密度深拆**：不仅解释业务逻辑与数据边界，还要用 `.annot-item` 或行内 `.term-chip` 把新手陌生语法（如可选链 `?.`、`CASE WHEN`、`.slice(-40)`、`e.preventDefault()`、`chrome.runtime.lastError`）一并讲透。
   - 严禁核心文件出现 `0` 条注解或行号越界。
4. **较长单文件或视图文件（如 `public/index.html`、单文件 Canvas 应用）**：
   - 使用 `data-focus="起始行-结束行"` + `data-toggle-view` 按钮提供「仅看核心行 / 展开完整文件」切换，或者按功能模块拆成渐进片段后再给出完整可复制文件。

---

## 二、每步验证与报错定位

- 每个实质性步骤末尾都应给出**当前即可执行的验证方法与预期现象**（如终端测试命令、浏览器 DevTools 观察点、或插件图标点亮效果）。
- 明确告诉零基础读者**报错去哪里看**：
  - 全栈项目区分「浏览器 F12 Network/Console」与「Node 终端窗口」；
  - 浏览器扩展区分「宿主页 F12（查 `content.js`）」、「扩展管理页 Service Worker 链接（查 `background.js`）」与「右键插件图标检查（查 `popup.js`）」。

---

## 三、脚本与 HTML 转义红线

- 直接写在 `<pre class="code-pre"><code>...</code></pre>` 内的 HTML 代码，必须将 `<` 与 `>` 转义为 `&lt;` 与 `&gt;`；若 JS 字符串字面量本身需要保留 `&amp;`、`&lt;`、`&gt;`（如转义函数 `.replace(/</g, "&lt;")`），在 `<code>` 源码中必须二次转义为 `&amp;amp;`、`&amp;lt;`、`&amp;gt;`，确保用户点击复制后得到完整可运行的正确代码。
- 写在 `<script>` 的 JS 字符串或模板字面量中的任何关闭标签，必须将 `</` 转义为 `<\/`（如 `<\/script>`、`<\/span>`）。
- 编写完成后，必须运行 `node skills/from-zero/scripts/verify-tutorial.mjs <目标文件.html>` 完成全量门禁校验。
