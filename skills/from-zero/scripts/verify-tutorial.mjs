#!/usr/bin/env node
/**
 * from-zero Phase 4 自动化门禁校验脚本（零外部依赖）
 * 用法: node verify-tutorial.mjs <file1.html> [file2.html ...]
 */
import fs from "node:fs";
import path from "node:path";

function expandArgs(args) {
  const out = [];
  for (const arg of args) {
    if (arg.includes("*")) {
      const dir = path.dirname(arg);
      const pattern = new RegExp(
        "^" + path.basename(arg).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"
      );
      if (fs.existsSync(dir)) {
        for (const entry of fs.readdirSync(dir)) {
          if (pattern.test(entry)) out.push(path.join(dir, entry));
        }
      }
    } else {
      out.push(arg);
    }
  }
  return out;
}

function parseLineSpec(spec) {
  const nums = [];
  for (const part of String(spec || "").split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const pieces = p.split("-").map((s) => Number(s.trim()));
      if (pieces.length !== 2 || pieces.some((n) => !Number.isInteger(n) || n < 1) || pieces[0] > pieces[1]) {
        return { error: `非法行号区间 "${p}"`, nums: [] };
      }
      for (let k = pieces[0]; k <= pieces[1]; k++) nums.push(k);
    } else {
      const n = Number(p);
      if (!Number.isInteger(n) || n < 1) {
        return { error: `非法行号 "${p}"`, nums: [] };
      }
      nums.push(n);
    }
  }
  return { error: null, nums };
}

function findMatchingDivEnd(html, openTagStart) {
  let depth = 0;
  let idx = openTagStart;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = openTagStart;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].startsWith("</")) {
      depth--;
      if (depth === 0) return m.index + m[0].length;
    } else {
      depth++;
    }
    idx = tagRe.lastIndex;
  }
  return -1;
}

function verifyFile(filePath) {
  const errors = [];
  const warnings = [];
  const html = fs.readFileSync(filePath, "utf8");
  const isShell = path.basename(filePath) === "tutorial-shell.html";

  // 1. 占位符与禁用机械标签检查
  if (!isShell) {
    const leftover = html.match(/\{\{PROJECT_[A-Z0-9_]+\}\}/g);
    if (leftover) {
      errors.push(`发现未替换的基座占位符: ${[...new Set(leftover)].join(", ")}`);
    }
  }
  for (const banned of ["人话翻译：", "直觉比喻：", "【大白话日常工作】"]) {
    if (html.includes(banned)) {
      errors.push(`出现禁用的机械标签 "${banned}"，请改用自然平实的中文叙述`);
    }
  }

  // 2. <script> 语法校验与 </ 安全转义检查
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length === 0) {
    errors.push("未找到任何 <script> 运行时代码块");
  }
  scripts.forEach((m, idx) => {
    const code = m[1];
    try {
      new Function(code);
    } catch (err) {
      errors.push(`Script #${idx + 1} 存在 JS 语法错误: ${err.message}`);
    }
    const rawClose = code.match(/<\/(?:script\b|[a-zA-Z!][a-zA-Z0-9-]*(?=[\s>]))/gi);
    if (rawClose) {
      errors.push(
        `Script #${idx + 1} 内发现 ${rawClose.length} 处未转义的 "</"（如 ${rawClose.slice(0, 3).join(", ")}），必须转义为 "<\\/"`
      );
    }
  });

  // 3. 校验 fzHighlightLine 对 URL 与实体字符串的词法高亮行为
  const runtimeScript = scripts[0]?.[1] || "";
  if (runtimeScript.includes("fzHighlightLine")) {
    try {
      const win = { addEventListener: () => {}, innerHeight: 800, scrollY: 0, requestAnimationFrame: () => {} };
      const mockDoc = {
        body: { getAttribute: () => "verify" },
        documentElement: { setAttribute: () => {}, getAttribute: () => "light", scrollHeight: 1000 },
        addEventListener: () => {},
        querySelectorAll: () => [],
        getElementById: () => null,
      };
      const fn = new Function("window", "document", "localStorage", runtimeScript);
      fn(win, mockDoc, { getItem: () => null, setItem: () => {} });
      if (typeof win.fzHighlightLine === "function") {
        const urlSample = win.fzHighlightLine('console.log("http://localhost:3000");', "js");
        if (urlSample.includes("tok-com") || !urlSample.includes("tok-str")) {
          errors.push('词法高亮器缺陷: "http://localhost:3000" 被误判为注释或未高亮为字符串');
        }
        const entitySample = win.fzHighlightLine('const s = "<div>";', "js");
        if (!entitySample.includes("tok-str")) {
          errors.push('词法高亮器缺陷: 含 "<" 或 "&" 的双引号字符串未被高亮为 tok-str');
        }
      }
    } catch (err) {
      warnings.push(`跳过词法高亮沙箱自检 (${err.message})`);
    }
  }

  // 4. 章节与步骤元数据检查
  if (!isShell) {
    const secTags = [...html.matchAll(/<section\b([^>]*)>/gi)];
    if (secTags.length === 0) {
      errors.push('未找到任何 <section class="section-block"> 章节');
    }
    const seenIds = new Set();
    const seenNums = new Set();
    for (const s of secTags) {
      const attrs = s[1];
      const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
      const num = (attrs.match(/\bdata-num="([^"]+)"/) || [])[1];
      const nav = (attrs.match(/\bdata-nav="([^"]+)"/) || [])[1];
      if (!id || !num || !nav) {
        errors.push(`<section> 缺少必要属性 (id/data-num/data-nav): <section${attrs}>`);
      } else {
        if (seenIds.has(id)) errors.push(`重复的 section id="${id}"`);
        if (seenNums.has(num)) errors.push(`重复的 section data-num="${num}"`);
        seenIds.add(id);
        seenNums.add(num);
      }
    }

    const stepIds = [...html.matchAll(/\bdata-step-id="([^"]+)"/g)].map((m) => m[1]);
    const stepSet = new Set();
    for (const sid of stepIds) {
      if (stepSet.has(sid)) errors.push(`重复的 data-step-id="${sid}"`);
      stepSet.add(sid);
    }

    // 检查交互沙盘操作指引 (.sandbox-guide)
    const hasInteractiveSandbox = /<(canvas|textarea)\b|<input\b[^>]*type=["']?(?:text|number|range)/i.test(html);
    if (hasInteractiveSandbox && !html.includes("sandbox-guide")) {
      warnings.push('检测到页面包含交互输入/画布沙盘，但缺少 ".sandbox-guide" 1-2-3 步操作指引');
    }
  }

  // 5. 代码精讲框行号精确性与 HTML 实体安全校验
  const cwOpenRe = /<div class="code-walkthrough"([^>]*)>/g;
  let match;
  let cwIndex = 0;
  while ((match = cwOpenRe.exec(html)) !== null) {
    cwIndex++;
    const attrs = match[1];
    const endIdx = findMatchingDivEnd(html, match.index);
    if (endIdx === -1) {
      errors.push(`第 ${cwIndex} 个 .code-walkthrough 标签未正常闭合`);
      continue;
    }
    const cwHtml = html.slice(match.index, endIdx);
    const titleMatch = cwHtml.match(/<div class="code-topbar">[\s\S]*?<code>([\s\S]*?)<\/code>/);
    const label = titleMatch ? titleMatch[1] : `CodeBlock #${cwIndex}`;
    const preMatch = cwHtml.match(/<pre class="code-pre"><code>([\s\S]*?)<\/code><\/pre>/);
    if (!preMatch) {
      errors.push(`[${label}] 缺少 <pre class="code-pre"><code>...</code></pre>`);
      continue;
    }
    const rawCode = preMatch[1].replace(/^\n+|\n+$/g, "");
    const lines = rawCode ? rawCode.split("\n") : [];
    const totalLines = lines.length;

    // 检查代码块内未转义 HTML 标签或二次转义丢失
    if (/<[a-zA-Z!/]/.test(rawCode)) {
      errors.push(`[${label}] 代码块内存在未转义的 "<tag"，必须写为 "&lt;tag"`);
    }
    if (
      /\.replace\([^)]*,\s*["']&(amp|lt|gt);["']\s*\)/.test(rawCode) ||
      /\.replace\(\s*\/&\/g\s*,\s*["']&["']\s*\)/.test(rawCode) ||
      /\.replace\(\s*\/<\/g\s*,\s*["']<["']\s*\)/.test(rawCode)
    ) {
      errors.push(`[${label}] 检测到疑似遗漏二次转义的实体替换（&amp; / &lt; 在 <code> 中需双写为 &amp;amp; / &amp;lt;）`);
    }

    // 检查 highlight 与 focus 行号范围
    const hlAttr = (attrs.match(/data-highlight="([^"]*)"/) || [])[1] || "";
    const focusAttr = (attrs.match(/data-focus="([^"]*)"/) || [])[1] || "";
    for (const [attrName, attrVal] of [["data-highlight", hlAttr], ["data-focus", focusAttr]]) {
      if (!attrVal) continue;
      const parsed = parseLineSpec(attrVal);
      if (parsed.error) {
        errors.push(`[${label}] ${attrName}="${attrVal}" ${parsed.error}`);
      } else {
        for (const n of parsed.nums) {
          if (n > totalLines) {
            errors.push(`[${label}] ${attrName}="${attrVal}" 行号 ${n} 越界（总行数 ${totalLines}）`);
          }
        }
      }
    }

    // 查找紧随其后的 .annot-list
    const afterSlice = html.slice(endIdx);
    const annotStartMatch = afterSlice.match(/^\s*<div class="annot-list">/);
    if (!annotStartMatch) {
      errors.push(`[${label}] 缺少配对的 .annot-list 注解列表（核心文件不允许 0 注解）`);
      continue;
    }
    const annotLocalStart = annotStartMatch[0].indexOf("<div");
    const annotLocalEnd = findMatchingDivEnd(afterSlice, annotLocalStart);
    if (annotLocalEnd === -1) {
      errors.push(`[${label}] .annot-list 标签未正常闭合`);
      continue;
    }
    const annotHtml = afterSlice.slice(annotLocalStart, annotLocalEnd);
    const annotSpecs = [...annotHtml.matchAll(/class="annot-item"[^>]*data-lines="([^"]*)"/g)].map((a) => a[1]);
    if (annotSpecs.length === 0) {
      errors.push(`[${label}] .annot-list 中没有带 data-lines 的 .annot-item`);
    }
    for (const spec of annotSpecs) {
      const parsed = parseLineSpec(spec);
      if (parsed.error) {
        errors.push(`[${label}] 注解 data-lines="${spec}" ${parsed.error}`);
      } else {
        for (const n of parsed.nums) {
          if (n > totalLines) {
            errors.push(`[${label}] 注解 data-lines="${spec}" 行号 ${n} 越界（总行数 ${totalLines}）`);
          }
        }
      }
    }
  }

  return { errors, warnings };
}

const targets = expandArgs(process.argv.slice(2));
if (targets.length === 0) {
  console.error("用法: node verify-tutorial.mjs <file1.html> [file2.html ...]");
  process.exit(2);
}

let hasError = false;
for (const file of targets) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error(`[FAIL] 文件不存在: ${abs}`);
    hasError = true;
    continue;
  }
  const { errors, warnings } = verifyFile(abs);
  if (errors.length === 0) {
    console.log(`[PASS] ${path.basename(abs)}`);
  } else {
    hasError = true;
    console.error(`[FAIL] ${path.basename(abs)}`);
    for (const e of errors) console.error(`  - ERROR: ${e}`);
  }
  for (const w of warnings) console.warn(`  - WARN: ${w}`);
}

process.exit(hasError ? 1 : 0);
