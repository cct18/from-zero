# 按需选用的轻量原语与高密度表达工具箱

> **重要提醒**：本工具箱提供与 `templates/tutorial-shell.html` 完全匹配的纯原生 HTML/CSS/SVG/JS 积木。请**根据当前项目和当前环节的认知需要自由选用与魔改**，严禁机械凑齐所有原语或把每个页面都做成同一个样子。不同项目的微沙盘（如全栈 SQL 实验台、手绘+状态栈双栏、MV3 三沙箱泳道、CLI 管道流模拟器、Agent 循环状态检视器）应直接写进项目专属 JS 中，围绕真实逻辑定制。

---

## 原语 1：行内术语微释义（`.term-chip`）

**适用场景**：正文中遇到新手可能卡壳的轻量术语或语法（如 `CORS`、`WAL 模式`、`可选链 ?.`、`Shadow DOM`）时，用行内虚线徽章标注。点击原地展开一条精炼解释，不打断主阅读流。

```html
<p>前端页面通过 <button class="term-chip" data-term-tip="浏览器内置的异步网络请求函数，用来向后端接口发送或拉取数据。">fetch()</button> 把表单数据发给服务器。</p>
```

---

## 原语 2：素雅契约与对照表（`.spec-table`）

**适用场景**：讲清全栈 REST API 路由契约、数据库字段定义、MV3 三个沙箱的权限边界或技术选型对比。

```html
<div class="spec-table-wrap">
  <table class="spec-table">
    <thead>
      <tr><th>HTTP 方法与路径</th><th>请求体 / 参数</th><th>成功状态码与返回</th><th>出错处理</th></tr>
    </thead>
    <tbody>
      <tr><td><code>GET /api/tasks</code></td><td>无</td><td><code>200</code> + 任务数组 JSON</td><td>数据库异常返回 <code>500</code></td></tr>
      <tr><td><code>POST /api/tasks</code></td><td><code>{ "title": "..." }</code></td><td><code>201</code> + 新建行对象</td><td>标题为空返回 <code>400</code></td></tr>
    </tbody>
  </table>
</div>
```

---

## 原语 3：紧凑因果流转带（`.causal-chain`）

**适用场景**：把“用户操作 → 触发函数 → 数据变形 → 状态/视图更新”的端到端因果链直观串起来。

```html
<div class="causal-chain">
  <div class="causal-step">
    <span class="causal-step-tag">01 · 触发入口</span>
    <div class="causal-step-title">表单 submit 事件</div>
    <p class="causal-step-desc"><code>e.preventDefault()</code> 阻止整页刷新。</p>
  </div>
  <div class="causal-arrow">→</div>
  <div class="causal-step">
    <span class="causal-step-tag">02 · 网络边界</span>
    <div class="causal-step-title">fetch POST JSON</div>
    <p class="causal-step-desc">携带 <code>Content-Type</code> 请求头发往 3000 端口。</p>
  </div>
  <div class="causal-arrow">→</div>
  <div class="causal-step">
    <span class="causal-step-tag">03 · 中间件解析</span>
    <div class="causal-step-title">express.json()</div>
    <p class="causal-step-desc">将原始文本解析挂载到 <code>req.body</code>。</p>
  </div>
</div>
```

---

## 原语 4：底层深挖与语法小课堂折叠区（`.deep-dive`）

**适用场景**：**主线必懂知识必须直接留在正文！** `.deep-dive` 仅用于承载锦上添花的底层原理扩展（如 B-Tree/WAL 写入细节）或 JS 语法小课堂（如 `?.` 与 `??` 区别），让零基础读者按需点开，不拖慢主线节奏。

```html
<details class="deep-dive">
  <summary>底层深挖：为什么开启 WAL 模式后，读写可以同时进行？</summary>
  <div class="deep-dive-body">
    <p>传统日志模式下，写入新数据时必须锁住整个数据库文件，此时其它读取请求只能干等；开启 <code>WAL (Write-Ahead Logging)</code> 后，新改动先追加写入旁边的 <code>-wal</code> 临时文件，读请求继续读主文件互不阻塞。</p>
  </div>
</details>
```

---

## 原语 5：双向联动代码精讲框（`.code-walkthrough`）

**基座内置能力**：`tutorial-shell.html` 会自动为以下代码结构提供：
1. **多语言词法高亮**（支持 `data-lang="js | html | css | json | py | bash"`，已修复双引号着色）；
2. **双向点击高亮与滚动联动**：点击下方 `.annot-item[data-lines]` 高亮并滚动到对应代码行；**点击上方带陶土红行号的代码行（`.has-annot`），也会反向高亮并滚动到对应的注解卡片**；
3. **长文件双视图切换**：配置 `data-focus="起始行-结束行"` 即可一键在「仅看核心行」与「展开完整文件」间切换。

```html
<div class="step-code-group">
  <div class="code-walkthrough" data-lang="js" data-highlight="4,5" data-focus="1-18">
    <div class="code-topbar">
      <code>db.js</code>
      <div class="code-actions">
        <button class="fz-btn" data-toggle-view>仅看核心行 (L1-L18)</button>
        <button class="fz-btn" data-copy-code>复制完整代码</button>
      </div>
    </div>
    <pre class="code-pre"><code>...</code></pre>
  </div>
  <div class="annot-list">
    <div class="annot-item" data-lines="4-5">
      <span class="fz-badge-terracotta">L4-L5</span>
      <p><strong>自动建库与 WAL：</strong>...</p>
    </div>
  </div>
</div>
```

*(注：SVG 拓扑边界图、跨隔离泳道图、Sticky 左文右图 `.sticky-split` 与可折叠目录树 `.tree-root` 同样可直接复用与魔改，确保 `<main>` 内部表达形态因项目而异。)*

---

## 原语 6：微沙盘操作指引条（`.sandbox-guide`）

**适用场景（硬性推荐）**：放在每一个可交互微沙盘的最顶部，用 1-2-3 步明确告诉零基础读者怎么玩转这个实验台、如何对比正常与踩坑分支，以及应该盯着哪个面板看变化。

```html
<div class="sandbox-guide">
  <div class="sandbox-guide-title">怎么操作这个实验台：</div>
  <ol>
    <li><strong>正常体验：</strong>保持上方复选框勾选，直接点击「发送请求」，观察右侧表里多出一行新任务。</li>
    <li><strong>复现踩坑：</strong>取消勾选复选框后再次提交带单引号的任务，观察左侧黑色日志窗口如何报出 500 语法崩溃。</li>
    <li><strong>修改与删除：</strong>点击右侧表格每行的「切换」或「删除」，观察 SQL 更新语句与表状态变化。</li>
  </ol>
</div>
```
