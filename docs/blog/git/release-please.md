---
title: release-please 自动化发布
createTime: 2026/04/30 14:58:31
permalink: /blog/cfm4wzu5/
tags:
  - git
  - CI/CD
  - 自动化发布
---

## 它是什么

[release-please](https://github.com/googleapis/release-please) 是 Google 开源的发布编排工具，**只做一件事**：解析 Conventional Commits 规范的提交记录，自动生成 Release PR，并在 PR 合并后打 tag、生成 GitHub Release、更新 `CHANGELOG.md` 与各语言的版本文件（`package.json` / `pyproject.toml` / `Cargo.toml` 等）。

::: tip 它不做什么
- 不发布到 npm / PyPI / crates.io 等包管理器（需要自己在工作流里追加发布步骤）
- 不处理复杂的分支合并策略
- 不关心你写代码的细节，只关心提交信息是否符合 Conventional Commits
  :::

它和其他发布工具最大的差异在于 **Release PR** 的概念：变更不会立即发布，而是堆积到一个长期存在的 Release PR 中，团队随时可以审阅下一版的 changelog，决定何时合并发版。

---

## Release PR 生命周期

通过 PR 上的 label 可以判断当前阶段：

| label                   | 含义                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `autorelease: pending`  | Release PR 已创建，等待合并                                |
| `autorelease: tagged`   | Release PR 已合并，tag 与 GitHub Release 已创建            |
| `autorelease: snapshot` | Java/Maven 等语言的 SNAPSHOT 版本特殊状态                  |
| `autorelease: closed`   | Release PR 被关闭（可能是误关，需要人工处理见下文）        |
| `autorelease: published` | 约定俗成的 label：表示已发布到包管理器（需自定义流程添加） |

合并 Release PR 后，release-please 会按顺序：

::: steps
1. **更新 changelog** 与各语言的版本文件
2. **创建 git tag**（形如 `v1.2.3` 或 `pkg-a-v1.2.3`）
3. **创建 GitHub Release**，正文取自本次 changelog 片段
:::

---

## 提交规范（Conventional Commits）

release-please 完全依赖提交信息，以下前缀必须掌握：

| 前缀                                | 语义                       | SemVer 影响                      |
| ----------------------------------- | -------------------------- | -------------------------------- |
| `fix:`                              | bug 修复                   | patch（0.0.X）                   |
| `feat:`                             | 新功能                     | minor（0.X.0）                   |
| `feat!:` / `fix!:` / `BREAKING CHANGE:` | 不兼容变更                 | major（X.0.0）                   |
| `chore:` / `build:` / `ci:` / `style:` / `test:` | 杂项                       | 不触发版本（==非"可发布单元"==） |
| `docs:` / `refactor:` / `perf:` / `deps:` | 默认不触发，部分语言会触发 | 见下表说明                       |

::: warning "可发布单元（releasable units）" 是关键概念
默认情况下，只有 `feat` / `fix` / `deps` 提交会触发版本号增加并产生 Release PR。`chore` 与 `build` 不会。**Java、Python 还会把 `docs` 视为可发布单元**。这意味着你写一堆 `chore: xxx` 的提交，release-please 不会认为有需要发版的内容。
:::

### 一次提交描述多个变更

通过 footer 形式可以在一次提交里塞多条 changelog 条目：

```text title="git-commit-message"
feat: adds v4 UUID to crypto

This adds support for v4 UUIDs to the library.

fix(utils): unicode no longer throws exception
  BREAKING-CHANGE: encode method no longer throws.

feat(utils): update encode to support unicode
```

上述提交会在 changelog 中产生 3 条记录，并把 `fix(utils)` 标记为 breaking change。

> [!important]
> 附加的条目必须放在 commit body **底部**，且建议使用 squash merge，否则解析容易出错。

---

## 基础使用

最常见的部署方式是 GitHub Action。建立 `.github/workflows/release-please.yml`：

```yaml title=".github/workflows/release-please.yml"
on:
  push:
    branches:
      - main

permissions:
  contents: write
  issues: write
  pull-requests: write

name: release-please

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          # 推荐用 PAT，否则 release PR 无法触发其他 workflow
          token: ${{ secrets.MY_RELEASE_PLEASE_TOKEN }}
          release-type: node # node / python / go / rust / simple ...
```

::: caution token 是最常踩的坑
内置 `secrets.GITHUB_TOKEN` 创建的 PR 与 tag **不会触发其他 workflow**（GitHub 反递归策略）。如果希望 Release PR 走完整 CI，或 tag 推送时触发 npm 发布，必须改用 PAT 或 GitHub App token。
:::

### 工作流权限

仓库 `Settings → Actions → General` 中：

- **Workflow permissions** 选 "Read and write permissions"
- 勾选 **Allow GitHub Actions to create and approve pull requests**

否则工作流会因权限不足报错。

### 配套发布到 npm

```yaml title="release-please.yml（节选）"
- uses: googleapis/release-please-action@v4
  id: release
  with:
    release-type: node

- uses: actions/checkout@v4
  if: ${{ steps.release.outputs.release_created }}

- uses: actions/setup-node@v4
  with:
    node-version: 20
    registry-url: 'https://registry.npmjs.org'
  if: ${{ steps.release.outputs.release_created }}

- run: npm ci && npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  if: ${{ steps.release.outputs.release_created }}
```

通过 `steps.<id>.outputs.release_created` 判断是否本次合并触发了发布，避免每次 push 都发包。

---

## 配置文件详解

简单仓库可以只用 `release-type` 输入。一旦需要自定义版本格式、附加文件更新、monorepo 等，必须切换到 **manifest 模式**：仓库根需要两个文件。

### `release-please-config.json`

主配置：

```json title="release-please-config.json"
{
  "release-type": "node",
  "include-component-in-tag": false,
  "bump-minor-pre-major": true,
  "bump-patch-for-minor-pre-major": false,
  "changelog-sections": [
    { "type": "feat", "section": "✨ 新功能" },
    { "type": "fix", "section": "🐛 修复" },
    { "type": "perf", "section": "⚡ 性能" },
    { "type": "deps", "section": "📦 依赖更新" },
    { "type": "refactor", "section": "♻️ 重构", "hidden": false },
    { "type": "docs", "section": "📚 文档", "hidden": true },
    { "type": "chore", "hidden": true }
  ],
  "include-v-in-tag": true,
  "packages": {
    ".": {
      "package-name": "my-app"
    }
  }
}
```

逐项说明：

- **`release-type`**：发布策略，决定 release-please 解析/更新哪些文件。常用值：`node` `python` `go` `rust` `java` `maven` `helm` `php` `ruby` `terraform-module` `simple`（仅维护 `version.txt`+`CHANGELOG.md`）。
- **`include-component-in-tag`**：tag 是否包含 component 名。单包仓库设为 `false`，tag 形如 `v1.2.3`；monorepo 设为 `true`，tag 形如 `pkg-a-v1.2.3`。
- **`bump-minor-pre-major`**：1.0 之前 BREAKING 是否只升 minor。开源库在未稳定前推荐 `true`，避免主版本号过早冲到 2.0。
- **`bump-patch-for-minor-pre-major`**：1.0 之前 `feat` 只升 patch（更保守）。
- **`changelog-sections`**：自定义 changelog 各类型的标题与是否隐藏。**自定义即整个数组覆盖默认值**，需要把所有想保留的类型都列出来。
- **`include-v-in-tag`**：tag 是否带 `v` 前缀（默认 `true`）。
- **`packages`**：必填，至少一项。`.` 表示仓库根。

### `.release-please-manifest.json`

记录每个包当前已发布的版本，由 release-please **自动维护**，但首次落地需要人工写入。

```json title=".release-please-manifest.json"
{
  ".": "1.4.2"
}
```

> [!note]
> 此文件人工修改的唯一时机是 **bootstrap**。一旦走通一次发布流程，后续都由工具自己写入，PR 中提交即可。

### Action 中指定配置文件

```yaml
- uses: googleapis/release-please-action@v4
  with:
    token: ${{ secrets.MY_RELEASE_PLEASE_TOKEN }}
    config-file: release-please-config.json
    manifest-file: .release-please-manifest.json
```

> [!important]
> v4 中**不要再设置 `release-type`**——一旦设置，action 会忽略 manifest 配置进入"简单模式"。这是 v3→v4 升级最常见的破坏性差异。

---

## 首次接入仓库（Bootstrap）

仓库已有大量提交历史时，直接跑 release-please 会把 **所有历史**塞进第一份 changelog。两种方案：

### 方案 A：CLI 自动 bootstrap（推荐）

```sh title="bootstrap"
npm i -g release-please

release-please bootstrap \
  --token=$GITHUB_TOKEN \
  --repo-url=owner/repo \
  --release-type=node
```

这会发起一个初始化 PR，生成两个配置文件并设置合理的起始 SHA。

### 方案 B：手动设置起点版本

在 manifest 中写入仓库当前已发布的版本：

```json
{
  ".": "1.4.2"
}
```

release-please 会以 `1.4.2` 为基线，从最近一次的 release tag（或 `bootstrap-sha`）之后的提交开始解析。

### 方案 C：限制起始 commit

在 config 中加 `bootstrap-sha`：

```json title="release-please-config.json"
{
  "bootstrap-sha": "6fc119838885b0cb831e78ddd23ac01cb819e585",
  "packages": { ".": {} }
}
```

> [!tip]
> 一旦第一次 Release PR 被合并，`bootstrap-sha` 字段就会被忽略，可以删除。

---

## 多包仓库（Monorepo）

manifest 模式天然支持 monorepo：

```json title="release-please-config.json"
{
  "plugins": ["node-workspace"],
  "packages": {
    "packages/core": {
      "release-type": "node",
      "component": "core"
    },
    "packages/cli": {
      "release-type": "node",
      "component": "cli"
    },
    "packages/python-sdk": {
      "release-type": "python",
      "package-name": "my-sdk",
      "component": "py-sdk",
      "changelog-path": "docs/CHANGES.md"
    }
  }
}
```

```json title=".release-please-manifest.json"
{
  "packages/core": "0.1.0",
  "packages/cli": "0.1.0",
  "packages/python-sdk": "0.1.0"
}
```

要点：

- 每个包一个 `path → 配置`。
- **`component`** 决定 tag 前缀和 changelog 的小标题。`core` 包的 tag 是 `core-v1.0.0`。
- **`release-type`** 可以混用，一个仓库同时管理 Node 和 Python 子包。
- **`exclude-paths`**（在某个包配置中）：忽略指定路径的提交，避免 monorepo 中根目录变更被多个包重复计入。

### Workspace 联动插件

不同语言的 workspace 需要不同插件来联动版本号：

| 插件              | 适用                     | 行为                                                                |
| ----------------- | ------------------------ | ------------------------------------------------------------------- |
| `node-workspace`  | npm/yarn/pnpm workspaces | 任一包升级，依赖它的本地包自动 patch 升级，并更新 `dependencies`    |
| `cargo-workspace` | Rust workspaces          | 同上，并更新 `Cargo.lock`                                           |
| `maven-workspace` | Maven 多模块             | 同上，更新 `pom.xml` 中的依赖版本                                   |
| `linked-versions` | 任意                     | 强制一组包共享同一版本号，发版时取组内最高版本                      |
| `sentence-case`   | 任意                     | changelog 条目首字母大写化（带常见词例外，如 gRPC）                 |
| `group-priority`  | 任意                     | 按组优先级开 PR；常用于 Java 区分 `snapshot` 和正式发布 PR 不混淆   |

`linked-versions` 与 workspace 插件同时使用时，需要给 workspace 插件加 `merge: false`，否则会冲突：

```json
{
  "plugins": [
    { "type": "cargo-workspace", "merge": false },
    {
      "type": "linked-versions",
      "groupName": "core-group",
      "components": ["pkgA", "pkgB"]
    }
  ]
}
```

### node-workspace 的 peerDependencies

默认不会更新 `peerDependencies`，因为这通常会引起破坏性变化。需要显式开启：

```json
{
  "plugins": [
    { "type": "node-workspace", "updatePeerDependencies": true }
  ]
}
```

### `separate-pull-requests`

默认行为是把所有包合并到 **一个** Release PR；设为 `true` 后每包一个 PR，方便分别审阅与回滚，但 PR 数量爆炸。

---

## 自定义能力总览

release-please 大量自定义点都集中在 manifest 配置或 action input 中。下面按场景归类。

### 1. 版本号策略

```json title="versioning-strategy"
{
  "versioning-strategy": "default",
  "packages": {
    "packages/lts": {
      "versioning-strategy": "always-bump-patch"
    }
  }
}
```

可选值：

- **`default`**：标准 SemVer。
- **`always-bump-patch`**：永远只升 patch。**适合 LTS / hotfix 分支**。
- **`always-bump-minor`** / **`always-bump-major`**：忽略提交语义，强制升级。
- **`service-pack`**：Java 风格 `1.2.3-sp.1`。
- **`prerelease`**：在 `1.2.0-beta01` 上递增；需配合根级 `"prerelease": true` 才会真正生成预发布版本。

### 2. 强制下次版本

在 commit body 中加一行：

```text
chore: release 2.0.0

Release-As: 2.0.0
```

或在 manifest 配置中设置 `release-as`：

```json
{
  "packages": {
    "packages/cli": {
      "release-as": "3.0.0"
    }
  }
}
```

> [!warning]
> 配置文件方式在 PR 合并后**不会自动清理**。下次跑 release-please 会继续用这个版本号导致死循环。**release 完后必须立刻删除或更新**。如果某个子包想恢复 conventional commits 推断，可以设置 `"release-as": ""`。

### 3. PR 标题与文案

```json
{
  "pull-request-title-pattern": "chore${scope}: release${component} ${version}",
  "pull-request-header": ":robot: 自动 Release，请审阅 changelog 后合并",
  "pull-request-footer": "由 release-please 生成",
  "group-pull-request-title-pattern": "chore: release ${branch}"
}
```

可用占位符：`${scope}` `${component}` `${version}` `${branch?}`。

> [!caution]
> 修改 `pull-request-title-pattern` 时不要破坏对 `${component}` 与 `${version}` 的可解析性。release-please 是反过来从已合并 PR 标题中**解析** version 来定位上次发布的，标题格式破了，工具就找不到上次发布点了。
>
> 同理：`component-no-space: true` 在已有 Release PR 时切换会让旧 PR 解析失败、新开重复 PR。

### 4. label 自定义

```json
{
  "label": "autorelease: pending,backend-team",
  "release-label": "autorelease: tagged,deployed"
}
```

逗号分隔多个 label。结合 `extra-labels` 还能给每包加额外标签便于检索。

### 5. Draft / Prerelease

```json
{
  "draft": true,
  "prerelease": true,
  "force-tag-creation": true
}
```

`draft: true` 时 GitHub Release 是草稿状态。**默认草稿不会创建 git tag**，会导致下一次 release-please 找不到上次发布点；务必同时设置 `force-tag-creation: true`。

### 6. 跳过部分动作

| 配置                       | 效果                                       |
| -------------------------- | ------------------------------------------ |
| `skip-github-release`      | 只更新 changelog 和 tag，不创建 GitHub Release |
| `skip-changelog`           | 不更新 changelog 文件（仍生成 PR 内容）    |
| `skip-github-pull-request` | 不开 PR（用于把"打 tag"和"开 PR"拆到不同任务） |
| `skip-snapshot`            | Java/Maven 不再自动生成 SNAPSHOT 版本      |
| `skip-labeling`            | 不打 release-please 的内置 label           |

### 7. 更新任意文件

最强大的扩展点。除了语言默认会更新的版本文件，还能让 release-please 改任意文件：

```json title="extra-files 示例"
{
  "extra-files": [
    "Dockerfile",
    {
      "type": "json",
      "path": "ui/package.json",
      "jsonpath": "$.version"
    },
    {
      "type": "yaml",
      "path": "deploy/values.yaml",
      "jsonpath": "$.image.tag"
    },
    {
      "type": "xml",
      "path": "android/app/build.gradle.xml",
      "xpath": "//version"
    },
    {
      "type": "toml",
      "path": "pyproject.toml",
      "jsonpath": "$.tool.poetry.version"
    },
    {
      "type": "generic",
      "path": "README.md"
    }
  ]
}
```

`generic` 类型基于 **行内注释锚点**：

```text title="Dockerfile"
LABEL version="1.2.3" # x-release-please-version
ENV APP_MAJOR=1       # x-release-please-major
```

或块级标注：

```yaml title="values.yaml"
# x-release-please-start-version
image:
  tag: 1.2.3
  fallback: 1.2.3
# x-release-please-end
```

支持的注释标记：`x-release-please-version` / `-major` / `-minor` / `-patch`，块级用 `-start-{type}` … `-end`。

### 8. changelog 来源

```json
{
  "changelog-type": "github"
}
```

- **`default`**（默认）：基于解析的 conventional commits 自行渲染。
- **`github`**：调 GitHub API 的 release notes 生成接口，对未严格遵守 conventional commits 的仓库更友好。

### 9. 多发布分支

支持同时维护 main 和 1.x、2.x 等长期分支：

```yaml title="release-multi-branch.yml"
on:
  push:
    branches:
      - main
      - 1.x
      - 2.x
jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          token: ${{ secrets.MY_RELEASE_PLEASE_TOKEN }}
          target-branch: ${{ github.ref_name }}
```

每条分支独立维护一份 Release PR，互不干扰。1.x 分支搭配 `versioning-strategy: always-bump-patch` 形成 LTS 流。

### 10. 写自定义插件 / 策略

底层全部 TypeScript：

- **新发布策略**：实现 `Strategy` 接口，参考 [`src/strategies/`](https://github.com/googleapis/release-please/tree/main/src/strategies) 的 `node.ts`、`rust.ts` 等。
- **新版本策略**：实现 `VersioningStrategy` 接口（[源文件](https://github.com/googleapis/release-please/blob/main/src/versioning-strategy.ts)）。
- **新 changelog 渲染器**：实现 `ChangelogNotes` 接口。
- **新 plugin**：继承 `ManifestPlugin`，实现 `run(pullRequests)` 方法，对候选 Release PR 列表进行后处理。

由于 release-please 主仓库是统一打包发布，自定义类型一般只能 fork 后注册进来。社区中常见的做法是：直接 fork → 改策略 → 走自托管 action。

---

## 社区高频问题与解决方案

### 1. Release PR 不更新或不创建

按官方"Step 1/2/3"逐项排查：

::: steps

1. **是否存在可发布单元？**
   合并的 PR 全是 `chore` / `build`？这些不会触发版本变更。补一个 `feat:` 或 `fix:`。

2. **检查旧 PR 上是否残留 label**
   搜索仓库内带 `autorelease: pending` 或 `autorelease: triggered` 的 PR。如果有一个残留没清掉的旧 PR，release-please 会以为发布还在进行中，拒绝再开新 PR。手动移除 label 后再触发。

3. **强制重跑**
   - GitHub App 用户：在最近一个被合并的功能 PR 上加 `release-please:force-run` label。
   - GitHub Action 用户：在 Actions 页面 re-run 工作流。

:::

### 2. 标题/Tag 变更后陷入循环

任何和"上一次发布定位"相关的字段（`pull-request-title-pattern` / `component-no-space` / `include-v-in-tag` / `tag-separator` 等）一旦在已有发布的仓库里改变，都可能导致 release-please 找不到上一次发布、把全部历史塞进新 changelog。

**解决**：

- 改之前先把当前所有 Release PR 合并或关闭；
- 修改完成后立刻在 manifest 中显式写入正确的当前版本；
- 必要时使用根级 `last-release-sha` 强制指定上次发布的 commit。

### 3. PR 合到 main 后没自动 tag

通常是 `GITHUB_TOKEN` 权限不足或仓库设置中 `Workflow permissions` 选了只读。检查：

- 工作流 `permissions` 块包含 `contents: write` 和 `pull-requests: write`；
- 仓库 Settings → Actions → General 里允许写入与允许 Action 创建 PR；
- 用 PAT 而非默认 token，否则 tag 不会触发后续 publish workflow。

### 4. Release PR 被误关闭后失效

PR 关闭时会被打 `autorelease: closed`，但**重开不会自动复原 `autorelease: pending`**。手动操作：

::: steps
1. 移除 `autorelease: closed`
2. 添加 `autorelease: pending`
3. 添加 `release-please:force-run`
:::

### 5. Draft Release 模式下找不到上次版本

`draft: true` 时 GitHub 不会真正创建 tag，导致下一轮 release-please 通过 tag 寻找上次发布失败，进而生成包含全部历史的 changelog。**必须同时设置 `force-tag-creation: true`**。

### 6. fork PR 不会被纳入 changelog

release-please 解析的是 **合并到目标分支的 commit**，因此 fork 中没合并的提交不会出现。fork PR 的提交者署名出现在 changelog 中，需要在 root 配置 `include-commit-authors: true`。

### 7. monorepo 中根目录的提交污染了所有包

一个 `fix:` 提交动了 `README.md`，所有子包都会跟着升 patch。解决方案是为每个包配置 `exclude-paths`，或把仓库根作为独立的 `.` 包并 exclude 子包路径。

### 8. 大型 monorepo API 频率超限

```json
{
  "release-search-depth": 400,
  "commit-search-depth": 500,
  "commit-batch-size": 10,
  "sequential-calls": true
}
```

- `release-search-depth` / `commit-search-depth`：限制翻页深度，避免对大仓库无限分页。
- `sequential-calls: true`：把对 GitHub API 的调用从并发改为串行，降低被限流概率。
- `commit-batch-size`：减小 GraphQL 单次拉取数量，减少超时。

### 9. CI 不在 Release PR 上跑

如前述，默认 token 创建的 PR 不触发 workflow。必须改用 PAT 或 GitHub App，**或者**给 release-please workflow 之外的 CI workflow 加 `pull_request_target` 触发器（注意安全风险）。

### 10. 提交里漏写规范，想补救 changelog

PR 已经合并，但提交信息没写好——直接编辑 PR body：

```text
BEGIN_COMMIT_OVERRIDE
feat: 支持 OAuth 登录
fix: 修复登录后 cookie 丢失
END_COMMIT_OVERRIDE
```

下次 release-please 运行会用这段覆盖原 commit message。**前提是用 squash merge**（merge commit 没法定位到具体哪个 commit 应当被覆盖）。

---

## CLI 直接使用与本地调试

本地装一个 release-please 用于排错，比起每次推到 CI 高效得多：

```sh title="本地调试"
npm i -g release-please
export GITHUB_TOKEN=ghp_xxx

# 仅打印将做什么，不真正发起 PR
release-please release-pr \
  --token=$GITHUB_TOKEN \
  --repo-url=owner/repo \
  --debug \
  --dry-run

# 在测试分支上跑
release-please release-pr \
  --repo-url=owner/repo \
  --target-branch=test-branch \
  --dry-run
```

::: tip
不要 fork 仓库做测试。release-please 依赖 PR / release / tag 这些资源，fork 不会带过去；正确做法是新建分支并用 `--target-branch` 指向它。
:::

---

## 推荐实践清单

::: card-grid
::: card title="使用 squash merge" icon="mdi:source-merge"
保持线性历史，让一个 PR 对应一个 changelog 条目；与 `BEGIN_COMMIT_OVERRIDE` 配合需要 squash。
:::

::: card title="一开始就上 manifest" icon="mdi:file-cog"
即使是单包仓库，未来要扩展到 monorepo / 多文件更新都更顺。同时配置爆炸式增长时 v3→v4 升级也最痛。
:::

::: card title="优先用 GitHub App" icon="mdi:robot-outline"
PAT 有过期/失效风险；GitHub App 颁发的安装 token 触发 workflow 的能力等同于人，权限可精细控制。
:::

::: card title="独立 publish workflow" icon="mdi:package-variant"
让 release-please 只负责 PR / tag / release，发布到包管理器单独写一个 workflow 通过 `release.published` 触发，按职责分离。
:::

::: card title="合并前 review changelog" icon="mdi:check-decagram"
Release PR 的核心价值就在于"合并前可见 changelog"，养成审阅习惯，发现错误随时修 PR body 用 override。
:::

::: card title="CI 必须能跑在 PR 上" icon="mdi:test-tube"
配 PAT 或 App，让单元测试 / lint 在 Release PR 上自动跑过，避免合并后才发现构建坏掉。
:::
:::

---

## 相关链接

- [release-please 主仓库](https://github.com/googleapis/release-please)
- [release-please-action（GitHub Action 包装器）](https://github.com/googleapis/release-please-action)
- [Manifest Releaser 文档](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)
- [Customizing 文档](https://github.com/googleapis/release-please/blob/main/docs/customizing.md)
- [Troubleshooting 文档](https://github.com/googleapis/release-please/blob/main/docs/troubleshooting.md)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [SemVer 规范](https://semver.org/)
