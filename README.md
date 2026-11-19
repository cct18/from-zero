# `from-zero` (`/from-zero`) — 项目驱动的交互式从零构建教程架构师

> **让零基础学习者与 Vibe Coder 真正看懂一个项目是如何从零长出来的。**
> 自底向上剖析任意本地代码库、GitHub 仓库或项目描述，基于 **Anthropic Claude 人文书卷设计基座** 生成**免编译、零依赖、可离线双击打开、且教学内容详实透彻的单文件交互式 HTML 教程**。

---

## ✨ 核心特性

1. **纯项目驱动的教学深度（Bottom-up Project-Driven）**：
   - 先从真实源码盘点「术语与语法障碍」「完整运行与实操流程」「核心原理与选型取舍」，将主线必懂知识自然融入对应环节讲透（拒绝删概念，也拒绝开篇背字典），不得阉割目标项目核心特性。
   - **双重自适应形态**：章节数量与版式结构完全随项目复杂度自然生长，按认知对象灵活选用 `.spec-table`、`.causal-chain`、`.term-chip`、`.deep-dive`、Sticky 左文右图或 SVG 边界拓扑，连续章节绝不雷同。
2. **项目原生可操作微沙盘（拒绝假交互）**：
   - 围绕项目核心机制编写真实可运行的轻量原生 JS 实验台（模拟全栈请求与内存表增删改查、真实手绘与 Markdown 实时笔记统一撤销重做、Chrome MV3 三沙箱异步消息与 Shadow DOM 气泡/生词本联动）。
3. **零基础友好基座与自动化门禁**：
   - `tutorial-shell.html` 内置多语言词法高亮（JS / HTML / CSS / JSON / Python / Bash）、**代码行 ↔ 注解双向点击高亮与滚动联动**、长文件「仅看核心行 / 展开完整文件」切换、自动目录扫描与 ScrollSpy、`localStorage` 进度记忆与 `file://` 剪贴板兜底。
   - 配备 `scripts/verify-tutorial.mjs` 零依赖门禁脚本，一键核查 JS 语法、脚本安全转义、代码行号精准度、实体转义及反模板红线。

---

## 📂 仓库结构（标准 Antigravity 插件布局）

```text
from_zero/
├── skills/
│   └── from-zero/                         # 核心 Agent Skill 包
│       ├── SKILL.md                       # 入口规范、Phase 1 盘点与 Phase 4 多重门禁
│       ├── references/                    # 渐进式披露参考规范（全中文统一）
│       │   ├── instructional-design.md    # 自底向上教学详实度、因果推演与中型仓库拆解
│       │   ├── project-archetypes.md      # 启发式源码核查视角与环节决策参考
│       │   ├── visualization-components.md # 按需选用的轻量原语与高密度表达工具箱
│       │   ├── adaptive-coding-guide.md   # 按文件性质自适应的编码实战与排错指南
│       │   └── claude-design-system.md    # Claude 暖米纸/深炭黑视觉 Token 与排版规范
│       ├── scripts/
│       │   └── verify-tutorial.mjs        # Phase 4 零依赖自动化门禁校验脚本
│       └── templates/
│           └── tutorial-shell.html        # 最小页面设计基座与双向联动高亮运行时
├── rules/
│   └── AGENTS.md                          # `/from-zero` 路由、门禁与双端同步规则
├── examples/                              # 2 类截然不同复杂度的端到端实测示例
│   ├── test-a-fullstack-todo.html         # 轻量全栈：Node + Express + SQLite 4 文件待办流（5 节）
│   └── test-b-zotero-in-ag.html           # 中型插件仓：Zotero in AG (MCP + FastAPI Sidecar + SQLite + PDF.js，6 节)
├── plugin.json                            # Antigravity 插件清单
├── sync.ps1                               # 项目仓库 <-> 全局生效插件同步脚本
├── .gitignore
└── README.md
```

---

## 🧪 自动化门禁校验

生成或修改任意单文件教程后，使用内置脚本执行全量质量校验：

```powershell
node .\skills\from-zero\scripts\verify-tutorial.mjs .\examples\*.html
```

---

## 🔄 双端同步（项目仓库 ↔ 全局生效插件）

```powershell
# 强制将项目仓库镜像到全局插件端（含 README.md 与清理已删文件）：
powershell -ExecutionPolicy Bypass -File .\sync.ps1 -Mode ProjectToGlobal
```
