<template><div><h2 id="它是什么" tabindex="-1"><a class="header-anchor" href="#它是什么"><span>它是什么</span></a></h2>
<p><a href="https://github.com/googleapis/release-please" target="_blank" rel="noopener noreferrer">release-please</a> 是 Google 开源的发布编排工具，<strong>只做一件事</strong>：解析 Conventional Commits 规范的提交记录，自动生成 Release PR，并在 PR 合并后打 tag、生成 GitHub Release、更新 <code v-pre>CHANGELOG.md</code> 与各语言的版本文件（<code v-pre>package.json</code> / <code v-pre>pyproject.toml</code> / <code v-pre>Cargo.toml</code> 等）。</p>
<div class="hint-container tip">
<p class="hint-container-title">它不做什么</p>
<ul>
<li>不发布到 npm / PyPI / crates.io 等包管理器（需要自己在工作流里追加发布步骤）</li>
<li>不处理复杂的分支合并策略</li>
<li>不关心你写代码的细节，只关心提交信息是否符合 Conventional Commits
:::</li>
</ul>
<p>它和其他发布工具最大的差异在于 <strong>Release PR</strong> 的概念：变更不会立即发布，而是堆积到一个长期存在的 Release PR 中，团队随时可以审阅下一版的 changelog，决定何时合并发版。</p>
<hr>
<h2 id="release-pr-生命周期" tabindex="-1"><a class="header-anchor" href="#release-pr-生命周期"><span>Release PR 生命周期</span></a></h2>
<p>通过 PR 上的 label 可以判断当前阶段：</p>
<table>
<thead>
<tr>
<th>label</th>
<th>含义</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>autorelease: pending</code></td>
<td>Release PR 已创建，等待合并</td>
</tr>
<tr>
<td><code v-pre>autorelease: tagged</code></td>
<td>Release PR 已合并，tag 与 GitHub Release 已创建</td>
</tr>
<tr>
<td><code v-pre>autorelease: snapshot</code></td>
<td>Java/Maven 等语言的 SNAPSHOT 版本特殊状态</td>
</tr>
<tr>
<td><code v-pre>autorelease: closed</code></td>
<td>Release PR 被关闭（可能是误关，需要人工处理见下文）</td>
</tr>
<tr>
<td><code v-pre>autorelease: published</code></td>
<td>约定俗成的 label：表示已发布到包管理器（需自定义流程添加）</td>
</tr>
</tbody>
</table>
<p>合并 Release PR 后，release-please 会按顺序：</p>
<div class="vp-steps"><ol>
<li><strong>更新 changelog</strong> 与各语言的版本文件</li>
<li><strong>创建 git tag</strong>（形如 <code v-pre>v1.2.3</code> 或 <code v-pre>pkg-a-v1.2.3</code>）</li>
<li><strong>创建 GitHub Release</strong>，正文取自本次 changelog 片段</li>
</ol>
</div></div>
<hr>
<h2 id="提交规范-conventional-commits" tabindex="-1"><a class="header-anchor" href="#提交规范-conventional-commits"><span>提交规范（Conventional Commits）</span></a></h2>
<p>release-please 完全依赖提交信息，以下前缀必须掌握：</p>
<table>
<thead>
<tr>
<th>前缀</th>
<th>语义</th>
<th>SemVer 影响</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>fix:</code></td>
<td>bug 修复</td>
<td>patch（0.0.X）</td>
</tr>
<tr>
<td><code v-pre>feat:</code></td>
<td>新功能</td>
<td>minor（0.X.0）</td>
</tr>
<tr>
<td><code v-pre>feat!:</code> / <code v-pre>fix!:</code> / <code v-pre>BREAKING CHANGE:</code></td>
<td>不兼容变更</td>
<td>major（X.0.0）</td>
</tr>
<tr>
<td><code v-pre>chore:</code> / <code v-pre>build:</code> / <code v-pre>ci:</code> / <code v-pre>style:</code> / <code v-pre>test:</code></td>
<td>杂项</td>
<td>不触发版本（<mark>非&quot;可发布单元&quot;</mark>）</td>
</tr>
<tr>
<td><code v-pre>docs:</code> / <code v-pre>refactor:</code> / <code v-pre>perf:</code> / <code v-pre>deps:</code></td>
<td>默认不触发，部分语言会触发</td>
<td>见下表说明</td>
</tr>
</tbody>
</table>
<div class="hint-container warning">
<p class="hint-container-title">&quot;可发布单元（releasable units）&quot; 是关键概念</p>
<p>默认情况下，只有 <code v-pre>feat</code> / <code v-pre>fix</code> / <code v-pre>deps</code> 提交会触发版本号增加并产生 Release PR。<code v-pre>chore</code> 与 <code v-pre>build</code> 不会。<strong>Java、Python 还会把 <code v-pre>docs</code> 视为可发布单元</strong>。这意味着你写一堆 <code v-pre>chore: xxx</code> 的提交，release-please 不会认为有需要发版的内容。</p>
</div>
<h3 id="一次提交描述多个变更" tabindex="-1"><a class="header-anchor" href="#一次提交描述多个变更"><span>一次提交描述多个变更</span></a></h3>
<p>通过 footer 形式可以在一次提交里塞多条 changelog 条目：</p>
<div class="code-block-title" data-title="git-commit-message"><div class="code-block-title-bar"><span class="title">git-commit-message</span></div><div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-text"><span class="line"><span>feat: adds v4 UUID to crypto</span></span>
<span class="line"><span></span></span>
<span class="line"><span>This adds support for v4 UUIDs to the library.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fix(utils): unicode no longer throws exception</span></span>
<span class="line"><span>  BREAKING-CHANGE: encode method no longer throws.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>feat(utils): update encode to support unicode</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>上述提交会在 changelog 中产生 3 条记录，并把 <code v-pre>fix(utils)</code> 标记为 breaking change。</p>
<div class="hint-container important">
<p class="hint-container-title">重要</p>
<p>附加的条目必须放在 commit body <strong>底部</strong>，且建议使用 squash merge，否则解析容易出错。</p>
</div>
<hr>
<h2 id="基础使用" tabindex="-1"><a class="header-anchor" href="#基础使用"><span>基础使用</span></a></h2>
<p>最常见的部署方式是 GitHub Action。建立 <code v-pre>.github/workflows/release-please.yml</code>：</p>
<div class="code-block-title" data-title=".github/workflows/release-please.yml"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-light-yaml"/>.github/workflows/release-please.yml</span></div><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76">on</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  push</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    branches</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      -</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> main</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">permissions</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  contents</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> write</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  issues</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> write</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  pull-requests</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> write</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> release-please</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">jobs</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  release-please</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    runs-on</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ubuntu-latest</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    steps</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> uses</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> googleapis/release-please-action@v4</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">        with</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">          # 推荐用 PAT，否则 release PR 无法触发其他 workflow</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">          token</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ secrets.MY_RELEASE_PLEASE_TOKEN }}</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">          release-type</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> node</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"> # node / python / go / rust / simple ...</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><div class="hint-container caution">
<p class="hint-container-title">token 是最常踩的坑</p>
<p>内置 <code v-pre>secrets.GITHUB_TOKEN</code> 创建的 PR 与 tag <strong>不会触发其他 workflow</strong>（GitHub 反递归策略）。如果希望 Release PR 走完整 CI，或 tag 推送时触发 npm 发布，必须改用 PAT 或 GitHub App token。</p>
</div>
<h3 id="工作流权限" tabindex="-1"><a class="header-anchor" href="#工作流权限"><span>工作流权限</span></a></h3>
<p>仓库 <code v-pre>Settings → Actions → General</code> 中：</p>
<ul>
<li><strong>Workflow permissions</strong> 选 &quot;Read and write permissions&quot;</li>
<li>勾选 <strong>Allow GitHub Actions to create and approve pull requests</strong></li>
</ul>
<p>否则工作流会因权限不足报错。</p>
<h3 id="配套发布到-npm" tabindex="-1"><a class="header-anchor" href="#配套发布到-npm"><span>配套发布到 npm</span></a></h3>
<div class="code-block-title" data-title="release-please.yml（节选）"><div class="code-block-title-bar"><span class="title">release-please.yml（节选）</span></div><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">-</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> uses</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> googleapis/release-please-action@v4</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  id</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> release</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  with</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    release-type</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> node</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">-</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> uses</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> actions/checkout@v4</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  if</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ steps.release.outputs.release_created }}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">-</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> uses</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> actions/setup-node@v4</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  with</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    node-version</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 20</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    registry-url</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 'https://registry.npmjs.org'</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  if</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ steps.release.outputs.release_created }}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">-</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> run</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> npm ci &#x26;&#x26; npm publish</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  env</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    NODE_AUTH_TOKEN</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ secrets.NPM_TOKEN }}</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  if</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ steps.release.outputs.release_created }}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>通过 <code v-pre>steps.&lt;id&gt;.outputs.release_created</code> 判断是否本次合并触发了发布，避免每次 push 都发包。</p>
<hr>
<h2 id="配置文件详解" tabindex="-1"><a class="header-anchor" href="#配置文件详解"><span>配置文件详解</span></a></h2>
<p>简单仓库可以只用 <code v-pre>release-type</code> 输入。一旦需要自定义版本格式、附加文件更新、monorepo 等，必须切换到 <strong>manifest 模式</strong>：仓库根需要两个文件。</p>
<h3 id="release-please-config-json" tabindex="-1"><a class="header-anchor" href="#release-please-config-json"><span><code v-pre>release-please-config.json</code></span></a></h3>
<p>主配置：</p>
<div class="code-block-title" data-title="release-please-config.json"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-json"/>release-please-config.json</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">release-type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "node"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">include-component-in-tag</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> false</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">bump-minor-pre-major</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">bump-patch-for-minor-pre-major</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> false</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">changelog-sections</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "feat"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">section</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "✨ 新功能"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "fix"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">section</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "🐛 修复"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "perf"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">section</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "⚡ 性能"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "deps"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">section</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "📦 依赖更新"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "refactor"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">section</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "♻️ 重构"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">hidden</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> false</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "docs"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">section</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "📚 文档"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">hidden</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "chore"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">hidden</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  ],</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">include-v-in-tag</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">.</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">package-name</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "my-app"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>逐项说明：</p>
<ul>
<li><strong><code v-pre>release-type</code></strong>：发布策略，决定 release-please 解析/更新哪些文件。常用值：<code v-pre>node</code> <code v-pre>python</code> <code v-pre>go</code> <code v-pre>rust</code> <code v-pre>java</code> <code v-pre>maven</code> <code v-pre>helm</code> <code v-pre>php</code> <code v-pre>ruby</code> <code v-pre>terraform-module</code> <code v-pre>simple</code>（仅维护 <code v-pre>version.txt</code>+<code v-pre>CHANGELOG.md</code>）。</li>
<li><strong><code v-pre>include-component-in-tag</code></strong>：tag 是否包含 component 名。单包仓库设为 <code v-pre>false</code>，tag 形如 <code v-pre>v1.2.3</code>；monorepo 设为 <code v-pre>true</code>，tag 形如 <code v-pre>pkg-a-v1.2.3</code>。</li>
<li><strong><code v-pre>bump-minor-pre-major</code></strong>：1.0 之前 BREAKING 是否只升 minor。开源库在未稳定前推荐 <code v-pre>true</code>，避免主版本号过早冲到 2.0。</li>
<li><strong><code v-pre>bump-patch-for-minor-pre-major</code></strong>：1.0 之前 <code v-pre>feat</code> 只升 patch（更保守）。</li>
<li><strong><code v-pre>changelog-sections</code></strong>：自定义 changelog 各类型的标题与是否隐藏。<strong>自定义即整个数组覆盖默认值</strong>，需要把所有想保留的类型都列出来。</li>
<li><strong><code v-pre>include-v-in-tag</code></strong>：tag 是否带 <code v-pre>v</code> 前缀（默认 <code v-pre>true</code>）。</li>
<li><strong><code v-pre>packages</code></strong>：必填，至少一项。<code v-pre>.</code> 表示仓库根。</li>
</ul>
<h3 id="release-please-manifest-json" tabindex="-1"><a class="header-anchor" href="#release-please-manifest-json"><span><code v-pre>.release-please-manifest.json</code></span></a></h3>
<p>记录每个包当前已发布的版本，由 release-please <strong>自动维护</strong>，但首次落地需要人工写入。</p>
<div class="code-block-title" data-title=".release-please-manifest.json"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-json"/>.release-please-manifest.json</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">.</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "1.4.2"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><div class="hint-container note">
<p class="hint-container-title">注</p>
<p>此文件人工修改的唯一时机是 <strong>bootstrap</strong>。一旦走通一次发布流程，后续都由工具自己写入，PR 中提交即可。</p>
</div>
<h3 id="action-中指定配置文件" tabindex="-1"><a class="header-anchor" href="#action-中指定配置文件"><span>Action 中指定配置文件</span></a></h3>
<div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">-</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> uses</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> googleapis/release-please-action@v4</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  with</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    token</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ secrets.MY_RELEASE_PLEASE_TOKEN }}</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    config-file</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> release-please-config.json</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    manifest-file</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> .release-please-manifest.json</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container important">
<p class="hint-container-title">重要</p>
<p>v4 中<strong>不要再设置 <code v-pre>release-type</code></strong>——一旦设置，action 会忽略 manifest 配置进入&quot;简单模式&quot;。这是 v3→v4 升级最常见的破坏性差异。</p>
</div>
<hr>
<h2 id="首次接入仓库-bootstrap" tabindex="-1"><a class="header-anchor" href="#首次接入仓库-bootstrap"><span>首次接入仓库（Bootstrap）</span></a></h2>
<p>仓库已有大量提交历史时，直接跑 release-please 会把 <strong>所有历史</strong>塞进第一份 changelog。两种方案：</p>
<h3 id="方案-a-cli-自动-bootstrap-推荐" tabindex="-1"><a class="header-anchor" href="#方案-a-cli-自动-bootstrap-推荐"><span>方案 A：CLI 自动 bootstrap（推荐）</span></a></h3>
<div class="code-block-title" data-title="bootstrap"><div class="code-block-title-bar"><span class="title">bootstrap</span></div><div class="language-sh line-numbers-mode" data-highlighter="shiki" data-ext="sh" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-sh"><span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">npm</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> i</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> -g</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> release-please</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">release-please</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> bootstrap</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --token=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">$GITHUB_TOKEN</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --repo-url=owner/repo</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --release-type=node</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>这会发起一个初始化 PR，生成两个配置文件并设置合理的起始 SHA。</p>
<h3 id="方案-b-手动设置起点版本" tabindex="-1"><a class="header-anchor" href="#方案-b-手动设置起点版本"><span>方案 B：手动设置起点版本</span></a></h3>
<p>在 manifest 中写入仓库当前已发布的版本：</p>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">.</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "1.4.2"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>release-please 会以 <code v-pre>1.4.2</code> 为基线，从最近一次的 release tag（或 <code v-pre>bootstrap-sha</code>）之后的提交开始解析。</p>
<h3 id="方案-c-限制起始-commit" tabindex="-1"><a class="header-anchor" href="#方案-c-限制起始-commit"><span>方案 C：限制起始 commit</span></a></h3>
<p>在 config 中加 <code v-pre>bootstrap-sha</code>：</p>
<div class="code-block-title" data-title="release-please-config.json"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-json"/>release-please-config.json</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">bootstrap-sha</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "6fc119838885b0cb831e78ddd23ac01cb819e585"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">.</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>一旦第一次 Release PR 被合并，<code v-pre>bootstrap-sha</code> 字段就会被忽略，可以删除。</p>
</div>
<hr>
<h2 id="多包仓库-monorepo" tabindex="-1"><a class="header-anchor" href="#多包仓库-monorepo"><span>多包仓库（Monorepo）</span></a></h2>
<p>manifest 模式天然支持 monorepo：</p>
<div class="code-block-title" data-title="release-please-config.json"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-json"/>release-please-config.json</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">plugins</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"node-workspace"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">],</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/core</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">release-type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "node"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">component</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "core"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/cli</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">release-type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "node"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">component</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "cli"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/python-sdk</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">release-type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "python"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">package-name</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "my-sdk"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">component</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "py-sdk"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">changelog-path</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "docs/CHANGES.md"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><div class="code-block-title" data-title=".release-please-manifest.json"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-json"/>.release-please-manifest.json</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/core</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "0.1.0"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/cli</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "0.1.0"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/python-sdk</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "0.1.0"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>要点：</p>
<ul>
<li>每个包一个 <code v-pre>path → 配置</code>。</li>
<li><strong><code v-pre>component</code></strong> 决定 tag 前缀和 changelog 的小标题。<code v-pre>core</code> 包的 tag 是 <code v-pre>core-v1.0.0</code>。</li>
<li><strong><code v-pre>release-type</code></strong> 可以混用，一个仓库同时管理 Node 和 Python 子包。</li>
<li><strong><code v-pre>exclude-paths</code></strong>（在某个包配置中）：忽略指定路径的提交，避免 monorepo 中根目录变更被多个包重复计入。</li>
</ul>
<h3 id="workspace-联动插件" tabindex="-1"><a class="header-anchor" href="#workspace-联动插件"><span>Workspace 联动插件</span></a></h3>
<p>不同语言的 workspace 需要不同插件来联动版本号：</p>
<table>
<thead>
<tr>
<th>插件</th>
<th>适用</th>
<th>行为</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>node-workspace</code></td>
<td>npm/yarn/pnpm workspaces</td>
<td>任一包升级，依赖它的本地包自动 patch 升级，并更新 <code v-pre>dependencies</code></td>
</tr>
<tr>
<td><code v-pre>cargo-workspace</code></td>
<td>Rust workspaces</td>
<td>同上，并更新 <code v-pre>Cargo.lock</code></td>
</tr>
<tr>
<td><code v-pre>maven-workspace</code></td>
<td>Maven 多模块</td>
<td>同上，更新 <code v-pre>pom.xml</code> 中的依赖版本</td>
</tr>
<tr>
<td><code v-pre>linked-versions</code></td>
<td>任意</td>
<td>强制一组包共享同一版本号，发版时取组内最高版本</td>
</tr>
<tr>
<td><code v-pre>sentence-case</code></td>
<td>任意</td>
<td>changelog 条目首字母大写化（带常见词例外，如 gRPC）</td>
</tr>
<tr>
<td><code v-pre>group-priority</code></td>
<td>任意</td>
<td>按组优先级开 PR；常用于 Java 区分 <code v-pre>snapshot</code> 和正式发布 PR 不混淆</td>
</tr>
</tbody>
</table>
<p><code v-pre>linked-versions</code> 与 workspace 插件同时使用时，需要给 workspace 插件加 <code v-pre>merge: false</code>，否则会冲突：</p>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">plugins</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "cargo-workspace"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">merge</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> false</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "linked-versions"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">groupName</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "core-group"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">components</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"pkgA"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "pkgB"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  ]</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="node-workspace-的-peerdependencies" tabindex="-1"><a class="header-anchor" href="#node-workspace-的-peerdependencies"><span>node-workspace 的 peerDependencies</span></a></h3>
<p>默认不会更新 <code v-pre>peerDependencies</code>，因为这通常会引起破坏性变化。需要显式开启：</p>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">plugins</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "node-workspace"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">updatePeerDependencies</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  ]</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="separate-pull-requests" tabindex="-1"><a class="header-anchor" href="#separate-pull-requests"><span><code v-pre>separate-pull-requests</code></span></a></h3>
<p>默认行为是把所有包合并到 <strong>一个</strong> Release PR；设为 <code v-pre>true</code> 后每包一个 PR，方便分别审阅与回滚，但 PR 数量爆炸。</p>
<hr>
<h2 id="自定义能力总览" tabindex="-1"><a class="header-anchor" href="#自定义能力总览"><span>自定义能力总览</span></a></h2>
<p>release-please 大量自定义点都集中在 manifest 配置或 action input 中。下面按场景归类。</p>
<h3 id="_1-版本号策略" tabindex="-1"><a class="header-anchor" href="#_1-版本号策略"><span>1. 版本号策略</span></a></h3>
<div class="code-block-title" data-title="versioning-strategy"><div class="code-block-title-bar"><span class="title">versioning-strategy</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">versioning-strategy</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "default"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/lts</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">versioning-strategy</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "always-bump-patch"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>可选值：</p>
<ul>
<li><strong><code v-pre>default</code></strong>：标准 SemVer。</li>
<li><strong><code v-pre>always-bump-patch</code></strong>：永远只升 patch。<strong>适合 LTS / hotfix 分支</strong>。</li>
<li><strong><code v-pre>always-bump-minor</code></strong> / <strong><code v-pre>always-bump-major</code></strong>：忽略提交语义，强制升级。</li>
<li><strong><code v-pre>service-pack</code></strong>：Java 风格 <code v-pre>1.2.3-sp.1</code>。</li>
<li><strong><code v-pre>prerelease</code></strong>：在 <code v-pre>1.2.0-beta01</code> 上递增；需配合根级 <code v-pre>&quot;prerelease&quot;: true</code> 才会真正生成预发布版本。</li>
</ul>
<h3 id="_2-强制下次版本" tabindex="-1"><a class="header-anchor" href="#_2-强制下次版本"><span>2. 强制下次版本</span></a></h3>
<p>在 commit body 中加一行：</p>
<div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-text"><span class="line"><span>chore: release 2.0.0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Release-As: 2.0.0</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>或在 manifest 配置中设置 <code v-pre>release-as</code>：</p>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">packages/cli</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">release-as</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "3.0.0"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container warning">
<p class="hint-container-title">注意</p>
<p>配置文件方式在 PR 合并后<strong>不会自动清理</strong>。下次跑 release-please 会继续用这个版本号导致死循环。<strong>release 完后必须立刻删除或更新</strong>。如果某个子包想恢复 conventional commits 推断，可以设置 <code v-pre>&quot;release-as&quot;: &quot;&quot;</code>。</p>
</div>
<h3 id="_3-pr-标题与文案" tabindex="-1"><a class="header-anchor" href="#_3-pr-标题与文案"><span>3. PR 标题与文案</span></a></h3>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">pull-request-title-pattern</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "chore${scope}: release${component} ${version}"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">pull-request-header</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ":robot: 自动 Release，请审阅 changelog 后合并"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">pull-request-footer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "由 release-please 生成"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">group-pull-request-title-pattern</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "chore: release ${branch}"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可用占位符：<code v-pre>${scope}</code> <code v-pre>${component}</code> <code v-pre>${version}</code> <code v-pre>${branch?}</code>。</p>
<div class="hint-container caution">
<p class="hint-container-title">警告</p>
<p>修改 <code v-pre>pull-request-title-pattern</code> 时不要破坏对 <code v-pre>${component}</code> 与 <code v-pre>${version}</code> 的可解析性。release-please 是反过来从已合并 PR 标题中<strong>解析</strong> version 来定位上次发布的，标题格式破了，工具就找不到上次发布点了。</p>
<p>同理：<code v-pre>component-no-space: true</code> 在已有 Release PR 时切换会让旧 PR 解析失败、新开重复 PR。</p>
</div>
<h3 id="_4-label-自定义" tabindex="-1"><a class="header-anchor" href="#_4-label-自定义"><span>4. label 自定义</span></a></h3>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">label</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "autorelease: pending,backend-team"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">release-label</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "autorelease: tagged,deployed"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>逗号分隔多个 label。结合 <code v-pre>extra-labels</code> 还能给每包加额外标签便于检索。</p>
<h3 id="_5-draft-prerelease" tabindex="-1"><a class="header-anchor" href="#_5-draft-prerelease"><span>5. Draft / Prerelease</span></a></h3>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">draft</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">prerelease</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">force-tag-creation</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>draft: true</code> 时 GitHub Release 是草稿状态。<strong>默认草稿不会创建 git tag</strong>，会导致下一次 release-please 找不到上次发布点；务必同时设置 <code v-pre>force-tag-creation: true</code>。</p>
<h3 id="_6-跳过部分动作" tabindex="-1"><a class="header-anchor" href="#_6-跳过部分动作"><span>6. 跳过部分动作</span></a></h3>
<table>
<thead>
<tr>
<th>配置</th>
<th>效果</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>skip-github-release</code></td>
<td>只更新 changelog 和 tag，不创建 GitHub Release</td>
</tr>
<tr>
<td><code v-pre>skip-changelog</code></td>
<td>不更新 changelog 文件（仍生成 PR 内容）</td>
</tr>
<tr>
<td><code v-pre>skip-github-pull-request</code></td>
<td>不开 PR（用于把&quot;打 tag&quot;和&quot;开 PR&quot;拆到不同任务）</td>
</tr>
<tr>
<td><code v-pre>skip-snapshot</code></td>
<td>Java/Maven 不再自动生成 SNAPSHOT 版本</td>
</tr>
<tr>
<td><code v-pre>skip-labeling</code></td>
<td>不打 release-please 的内置 label</td>
</tr>
</tbody>
</table>
<h3 id="_7-更新任意文件" tabindex="-1"><a class="header-anchor" href="#_7-更新任意文件"><span>7. 更新任意文件</span></a></h3>
<p>最强大的扩展点。除了语言默认会更新的版本文件，还能让 release-please 改任意文件：</p>
<div class="code-block-title" data-title="extra-files 示例"><div class="code-block-title-bar"><span class="title">extra-files 示例</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">extra-files</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">    "Dockerfile"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "json"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">path</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "ui/package.json"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">jsonpath</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "$.version"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "yaml"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">path</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "deploy/values.yaml"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">jsonpath</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "$.image.tag"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "xml"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">path</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "android/app/build.gradle.xml"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">xpath</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "//version"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "toml"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">path</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "pyproject.toml"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">jsonpath</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "$.tool.poetry.version"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    },</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    {</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "generic"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">path</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "README.md"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">    }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  ]</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p><code v-pre>generic</code> 类型基于 <strong>行内注释锚点</strong>：</p>
<div class="code-block-title" data-title="Dockerfile"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-docker"/>Dockerfile</span></div><div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-text"><span class="line"><span>LABEL version="1.2.3" # x-release-please-version</span></span>
<span class="line"><span>ENV APP_MAJOR=1       # x-release-please-major</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></div><p>或块级标注：</p>
<div class="code-block-title" data-title="values.yaml"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-light-yaml"/>values.yaml</span></div><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># x-release-please-start-version</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">image</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  tag</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 1.2.3</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  fallback</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 1.2.3</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># x-release-please-end</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>支持的注释标记：<code v-pre>x-release-please-version</code> / <code v-pre>-major</code> / <code v-pre>-minor</code> / <code v-pre>-patch</code>，块级用 <code v-pre>-start-{type}</code> … <code v-pre>-end</code>。</p>
<h3 id="_8-changelog-来源" tabindex="-1"><a class="header-anchor" href="#_8-changelog-来源"><span>8. changelog 来源</span></a></h3>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">changelog-type</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "github"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li><strong><code v-pre>default</code></strong>（默认）：基于解析的 conventional commits 自行渲染。</li>
<li><strong><code v-pre>github</code></strong>：调 GitHub API 的 release notes 生成接口，对未严格遵守 conventional commits 的仓库更友好。</li>
</ul>
<h3 id="_9-多发布分支" tabindex="-1"><a class="header-anchor" href="#_9-多发布分支"><span>9. 多发布分支</span></a></h3>
<p>支持同时维护 main 和 1.x、2.x 等长期分支：</p>
<div class="code-block-title" data-title="release-multi-branch.yml"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-light-yaml"/>release-multi-branch.yml</span></div><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76">on</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  push</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    branches</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      -</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> main</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      -</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 1.x</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      -</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 2.x</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">jobs</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">  release-please</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    runs-on</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ubuntu-latest</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    steps</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> uses</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> googleapis/release-please-action@v4</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">        with</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">          token</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ secrets.MY_RELEASE_PLEASE_TOKEN }}</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">          target-branch</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ${{ github.ref_name }}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>每条分支独立维护一份 Release PR，互不干扰。1.x 分支搭配 <code v-pre>versioning-strategy: always-bump-patch</code> 形成 LTS 流。</p>
<h3 id="_10-写自定义插件-策略" tabindex="-1"><a class="header-anchor" href="#_10-写自定义插件-策略"><span>10. 写自定义插件 / 策略</span></a></h3>
<p>底层全部 TypeScript：</p>
<ul>
<li><strong>新发布策略</strong>：实现 <code v-pre>Strategy</code> 接口，参考 <a href="https://github.com/googleapis/release-please/tree/main/src/strategies" target="_blank" rel="noopener noreferrer"><code v-pre>src/strategies/</code></a> 的 <code v-pre>node.ts</code>、<code v-pre>rust.ts</code> 等。</li>
<li><strong>新版本策略</strong>：实现 <code v-pre>VersioningStrategy</code> 接口（<a href="https://github.com/googleapis/release-please/blob/main/src/versioning-strategy.ts" target="_blank" rel="noopener noreferrer">源文件</a>）。</li>
<li><strong>新 changelog 渲染器</strong>：实现 <code v-pre>ChangelogNotes</code> 接口。</li>
<li><strong>新 plugin</strong>：继承 <code v-pre>ManifestPlugin</code>，实现 <code v-pre>run(pullRequests)</code> 方法，对候选 Release PR 列表进行后处理。</li>
</ul>
<p>由于 release-please 主仓库是统一打包发布，自定义类型一般只能 fork 后注册进来。社区中常见的做法是：直接 fork → 改策略 → 走自托管 action。</p>
<hr>
<h2 id="社区高频问题与解决方案" tabindex="-1"><a class="header-anchor" href="#社区高频问题与解决方案"><span>社区高频问题与解决方案</span></a></h2>
<h3 id="_1-release-pr-不更新或不创建" tabindex="-1"><a class="header-anchor" href="#_1-release-pr-不更新或不创建"><span>1. Release PR 不更新或不创建</span></a></h3>
<p>按官方&quot;Step 1/2/3&quot;逐项排查：</p>
<div class="vp-steps"><ol>
<li>
<p><strong>是否存在可发布单元？</strong>
合并的 PR 全是 <code v-pre>chore</code> / <code v-pre>build</code>？这些不会触发版本变更。补一个 <code v-pre>feat:</code> 或 <code v-pre>fix:</code>。</p>
</li>
<li>
<p><strong>检查旧 PR 上是否残留 label</strong>
搜索仓库内带 <code v-pre>autorelease: pending</code> 或 <code v-pre>autorelease: triggered</code> 的 PR。如果有一个残留没清掉的旧 PR，release-please 会以为发布还在进行中，拒绝再开新 PR。手动移除 label 后再触发。</p>
</li>
<li>
<p><strong>强制重跑</strong></p>
<ul>
<li>GitHub App 用户：在最近一个被合并的功能 PR 上加 <code v-pre>release-please:force-run</code> label。</li>
<li>GitHub Action 用户：在 Actions 页面 re-run 工作流。</li>
</ul>
</li>
</ol>
</div><h3 id="_2-标题-tag-变更后陷入循环" tabindex="-1"><a class="header-anchor" href="#_2-标题-tag-变更后陷入循环"><span>2. 标题/Tag 变更后陷入循环</span></a></h3>
<p>任何和&quot;上一次发布定位&quot;相关的字段（<code v-pre>pull-request-title-pattern</code> / <code v-pre>component-no-space</code> / <code v-pre>include-v-in-tag</code> / <code v-pre>tag-separator</code> 等）一旦在已有发布的仓库里改变，都可能导致 release-please 找不到上一次发布、把全部历史塞进新 changelog。</p>
<p><strong>解决</strong>：</p>
<ul>
<li>改之前先把当前所有 Release PR 合并或关闭；</li>
<li>修改完成后立刻在 manifest 中显式写入正确的当前版本；</li>
<li>必要时使用根级 <code v-pre>last-release-sha</code> 强制指定上次发布的 commit。</li>
</ul>
<h3 id="_3-pr-合到-main-后没自动-tag" tabindex="-1"><a class="header-anchor" href="#_3-pr-合到-main-后没自动-tag"><span>3. PR 合到 main 后没自动 tag</span></a></h3>
<p>通常是 <code v-pre>GITHUB_TOKEN</code> 权限不足或仓库设置中 <code v-pre>Workflow permissions</code> 选了只读。检查：</p>
<ul>
<li>工作流 <code v-pre>permissions</code> 块包含 <code v-pre>contents: write</code> 和 <code v-pre>pull-requests: write</code>；</li>
<li>仓库 Settings → Actions → General 里允许写入与允许 Action 创建 PR；</li>
<li>用 PAT 而非默认 token，否则 tag 不会触发后续 publish workflow。</li>
</ul>
<h3 id="_4-release-pr-被误关闭后失效" tabindex="-1"><a class="header-anchor" href="#_4-release-pr-被误关闭后失效"><span>4. Release PR 被误关闭后失效</span></a></h3>
<p>PR 关闭时会被打 <code v-pre>autorelease: closed</code>，但<strong>重开不会自动复原 <code v-pre>autorelease: pending</code></strong>。手动操作：</p>
<div class="vp-steps"><ol>
<li>移除 <code v-pre>autorelease: closed</code></li>
<li>添加 <code v-pre>autorelease: pending</code></li>
<li>添加 <code v-pre>release-please:force-run</code></li>
</ol>
</div><h3 id="_5-draft-release-模式下找不到上次版本" tabindex="-1"><a class="header-anchor" href="#_5-draft-release-模式下找不到上次版本"><span>5. Draft Release 模式下找不到上次版本</span></a></h3>
<p><code v-pre>draft: true</code> 时 GitHub 不会真正创建 tag，导致下一轮 release-please 通过 tag 寻找上次发布失败，进而生成包含全部历史的 changelog。<strong>必须同时设置 <code v-pre>force-tag-creation: true</code></strong>。</p>
<h3 id="_6-fork-pr-不会被纳入-changelog" tabindex="-1"><a class="header-anchor" href="#_6-fork-pr-不会被纳入-changelog"><span>6. fork PR 不会被纳入 changelog</span></a></h3>
<p>release-please 解析的是 <strong>合并到目标分支的 commit</strong>，因此 fork 中没合并的提交不会出现。fork PR 的提交者署名出现在 changelog 中，需要在 root 配置 <code v-pre>include-commit-authors: true</code>。</p>
<h3 id="_7-monorepo-中根目录的提交污染了所有包" tabindex="-1"><a class="header-anchor" href="#_7-monorepo-中根目录的提交污染了所有包"><span>7. monorepo 中根目录的提交污染了所有包</span></a></h3>
<p>一个 <code v-pre>fix:</code> 提交动了 <code v-pre>README.md</code>，所有子包都会跟着升 patch。解决方案是为每个包配置 <code v-pre>exclude-paths</code>，或把仓库根作为独立的 <code v-pre>.</code> 包并 exclude 子包路径。</p>
<h3 id="_8-大型-monorepo-api-频率超限" tabindex="-1"><a class="header-anchor" href="#_8-大型-monorepo-api-频率超限"><span>8. 大型 monorepo API 频率超限</span></a></h3>
<div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">release-search-depth</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 400</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">commit-search-depth</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 500</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">commit-batch-size</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">sequential-calls</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li><code v-pre>release-search-depth</code> / <code v-pre>commit-search-depth</code>：限制翻页深度，避免对大仓库无限分页。</li>
<li><code v-pre>sequential-calls: true</code>：把对 GitHub API 的调用从并发改为串行，降低被限流概率。</li>
<li><code v-pre>commit-batch-size</code>：减小 GraphQL 单次拉取数量，减少超时。</li>
</ul>
<h3 id="_9-ci-不在-release-pr-上跑" tabindex="-1"><a class="header-anchor" href="#_9-ci-不在-release-pr-上跑"><span>9. CI 不在 Release PR 上跑</span></a></h3>
<p>如前述，默认 token 创建的 PR 不触发 workflow。必须改用 PAT 或 GitHub App，<strong>或者</strong>给 release-please workflow 之外的 CI workflow 加 <code v-pre>pull_request_target</code> 触发器（注意安全风险）。</p>
<h3 id="_10-提交里漏写规范-想补救-changelog" tabindex="-1"><a class="header-anchor" href="#_10-提交里漏写规范-想补救-changelog"><span>10. 提交里漏写规范，想补救 changelog</span></a></h3>
<p>PR 已经合并，但提交信息没写好——直接编辑 PR body：</p>
<div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-text"><span class="line"><span>BEGIN_COMMIT_OVERRIDE</span></span>
<span class="line"><span>feat: 支持 OAuth 登录</span></span>
<span class="line"><span>fix: 修复登录后 cookie 丢失</span></span>
<span class="line"><span>END_COMMIT_OVERRIDE</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下次 release-please 运行会用这段覆盖原 commit message。<strong>前提是用 squash merge</strong>（merge commit 没法定位到具体哪个 commit 应当被覆盖）。</p>
<hr>
<h2 id="cli-直接使用与本地调试" tabindex="-1"><a class="header-anchor" href="#cli-直接使用与本地调试"><span>CLI 直接使用与本地调试</span></a></h2>
<p>本地装一个 release-please 用于排错，比起每次推到 CI 高效得多：</p>
<div class="code-block-title" data-title="本地调试"><div class="code-block-title-bar"><span class="title">本地调试</span></div><div class="language-sh line-numbers-mode" data-highlighter="shiki" data-ext="sh" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-sh"><span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">npm</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> i</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> -g</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> release-please</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">export</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> GITHUB_TOKEN</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">ghp_xxx</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 仅打印将做什么，不真正发起 PR</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">release-please</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> release-pr</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --token=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">$GITHUB_TOKEN</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --repo-url=owner/repo</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --debug</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --dry-run</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 在测试分支上跑</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">release-please</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> release-pr</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --repo-url=owner/repo</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --target-branch=test-branch</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F4B8E4"> \</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">  --dry-run</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>不要 fork 仓库做测试。release-please 依赖 PR / release / tag 这些资源，fork 不会带过去；正确做法是新建分支并用 <code v-pre>--target-branch</code> 指向它。</p>
</div>
<hr>
<h2 id="推荐实践清单" tabindex="-1"><a class="header-anchor" href="#推荐实践清单"><span>推荐实践清单</span></a></h2>
<VPCardGrid><VPCard title="使用 squash merge" icon="mdi:source-merge"><p>保持线性历史，让一个 PR 对应一个 changelog 条目；与 <code v-pre>BEGIN_COMMIT_OVERRIDE</code> 配合需要 squash。</p>
</VPCard></VPCardGrid><VPCard title="一开始就上 manifest" icon="mdi:file-cog"><p>即使是单包仓库，未来要扩展到 monorepo / 多文件更新都更顺。同时配置爆炸式增长时 v3→v4 升级也最痛。</p>
</VPCard><VPCard title="优先用 GitHub App" icon="mdi:robot-outline"><p>PAT 有过期/失效风险；GitHub App 颁发的安装 token 触发 workflow 的能力等同于人，权限可精细控制。</p>
</VPCard><VPCard title="独立 publish workflow" icon="mdi:package-variant"><p>让 release-please 只负责 PR / tag / release，发布到包管理器单独写一个 workflow 通过 <code v-pre>release.published</code> 触发，按职责分离。</p>
</VPCard><VPCard title="合并前 review changelog" icon="mdi:check-decagram"><p>Release PR 的核心价值就在于&quot;合并前可见 changelog&quot;，养成审阅习惯，发现错误随时修 PR body 用 override。</p>
</VPCard><VPCard title="CI 必须能跑在 PR 上" icon="mdi:test-tube"><p>配 PAT 或 App，让单元测试 / lint 在 Release PR 上自动跑过，避免合并后才发现构建坏掉。</p>
</VPCard><p>:::</p>
<hr>
<h2 id="相关链接" tabindex="-1"><a class="header-anchor" href="#相关链接"><span>相关链接</span></a></h2>
<ul>
<li><a href="https://github.com/googleapis/release-please" target="_blank" rel="noopener noreferrer">release-please 主仓库</a></li>
<li><a href="https://github.com/googleapis/release-please-action" target="_blank" rel="noopener noreferrer">release-please-action（GitHub Action 包装器）</a></li>
<li><a href="https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md" target="_blank" rel="noopener noreferrer">Manifest Releaser 文档</a></li>
<li><a href="https://github.com/googleapis/release-please/blob/main/docs/customizing.md" target="_blank" rel="noopener noreferrer">Customizing 文档</a></li>
<li><a href="https://github.com/googleapis/release-please/blob/main/docs/troubleshooting.md" target="_blank" rel="noopener noreferrer">Troubleshooting 文档</a></li>
<li><a href="https://www.conventionalcommits.org/" target="_blank" rel="noopener noreferrer">Conventional Commits 规范</a></li>
<li><a href="https://semver.org/" target="_blank" rel="noopener noreferrer">SemVer 规范</a></li>
</ul>
</div></template>


