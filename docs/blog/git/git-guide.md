---
title: Git 日常工作指南：命令速查、协作流程与配置
tags:
  - git
  - 开发工具
  - 团队协作
createTime: 2026/11/12 14:14:16
permalink: /blog/e6fav8w9/
---

## 如何使用这份指南

面向已经使用过 Git 的开发者：不从安装和概念史讲起，而是回答「现在该执行哪条命令」「会改动什么」「出错后怎么恢复」。

**章节及各节命令表按典型业务开发中的使用频率大致降序排列**，不是严格的统计排名；示例中的命令则按执行顺序排列。首次配置环境可先跳到[身份与基础配置](#configuration)、[多站点 SSH](#ssh)和[外部 diff / merge 工具](#external-tools)。

约定：

- 推荐使用近期 Git 2.x；`switch` / `restore` 要求 Git 2.23+，`init -b` 要求 Git 2.28+。通过 `git --version` 检查版本。
- 默认主分支为 `main`，远端为 `origin`，功能分支为 `feature/login`；按项目实际名称替换。
- 命令在仓库根目录执行。示例使用 Bash / Zsh / Git Bash；SSH 文件权限命令适用于 macOS / Linux。
- 表格中的 `<提交>`、`<路径>` 等是占位符，**不要连同尖括号一起输入**；代码块中的示例哈希也必须替换。
- 同一代码块可能展示多个可选操作，带有「二选一」「按需执行」的命令不要全部运行。
- `HEAD`[^head]、暂存区[^index]、上游分支[^upstream]等术语在文末有简短释义。

[[TOC]]

## 1. 查看状态、差异与历史

**场景：** 开始工作、提交前自检、代码评审，以及确认「谁在什么时候改了什么」。执行任何撤销操作前，先看这里。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 高频 | `git status -sb` | 简洁查看状态和分支；`-s` 为短格式，`-b` 显示分支及上游差距 |
| 高频 | `git diff` | 查看工作区相对暂存区的差异，不含未跟踪文件 |
| 高频 | `git diff --staged` | 查看暂存区相对 `HEAD` 的差异，即下一次提交的内容；`--cached` 是同义选项 |
| 高频 | `git log --oneline -10` | 最近 10 个提交；`--oneline` 每个提交一行，`-10` 限制数量 |
| 常用 | `git log -1 --format=fuller` | 只看最新 1 个提交；`--format=fuller` 展示作者、提交者及各自时间 |
| 常用 | `git show <提交>` | 查看某次提交的说明和补丁；不传提交则查看 `HEAD` |
| 常用 | `git diff --stat` | 只看各文件改动量；`--stat` 不展示完整补丁 |
| 常用 | `git log --graph --oneline --decorate --all` | 绘制文本分支图；`--decorate` 显示引用名称，`--all` 纳入所有本地引用 |
| 按需 | `git log -p -- <路径>` | 查看影响某路径的提交及补丁；`-p` 显示补丁，`--` 分隔选项/版本与路径 |
| 按需 | `git blame -L 20,40 -- <路径>` | 查看第 20～40 行最近归属的提交；`-L` 指定行范围 |
| 按需 | `git log -S '旧函数名' -- <路径>` | 查找某字符串出现次数发生变化的提交；`-S` 适合追踪引入或删除 |

### 读懂 status 的两列

`git status --short` 的前两列分别表示**暂存区相对 HEAD**、**工作区相对暂存区**的状态。未跟踪文件用 `??` 表示。

```text title="status-example.txt"
M  src/login.ts     ← 已暂存修改
 M src/logout.ts    ← 尚未暂存修改
MM src/session.ts   ← 已暂存后又继续修改
?? notes.txt        ← 未跟踪
UU src/config.ts    ← 双方都修改，冲突尚未解决
```

### 提交范围与分支差异

```bash title="inspect-history.sh"
# 最新一个提交的补丁；-1 限制数量，-p 输出补丁
git log -1 -p

# 本地 main 尚未包含、但 feature/login 中存在的提交
git log --oneline main..feature/login

# 两个分支当前快照的直接差异
git diff main feature/login

# 从共同祖先到功能分支的差异，适合审查该分支引入的改动
git diff main...feature/login

# 只看某个文件；-- 后的内容按路径解释
git diff -- src/login.ts
```

`log A..B` 是提交集合差；`diff A B`（或 `diff A..B`）是两端快照差；`diff A...B` 是共同祖先到 B 的差。不要把 `log` 与 `diff` 的点号语义混为一谈。需要基于远端最新状态审查时，先 `git fetch origin`，再用 `origin/main` 替换 `main`。

## 2. 暂存、提交与修改最近一次提交

**场景：** 将一批相关修改整理成可以独立评审、回退的提交。提交的是暂存区，不是整个工作目录。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 高频 | `git add <路径>` | 将指定文件的当前内容加入暂存区；也可暂存该路径的删除 |
| 高频 | `git commit -m "说明"` | 创建提交；`-m` 提供提交说明 |
| 常用 | `git add -p` | 分块选择要暂存的修改；`-p` 为交互式补丁模式 |
| 常用 | `git add -A` | 暂存整个仓库的新增、修改和删除；执行后务必检查差异 |
| 常用 | `git restore --staged <路径>` | 取消暂存，保留工作区修改；默认以 `HEAD` 为暂存区恢复来源 |
| 常用 | `git commit --amend --no-edit` | 用当前暂存区修订最近一次提交，保留原说明；会产生新的提交哈希 |
| 按需 | `git commit --amend -m "新说明"` | 修改最近提交的说明，同时纳入当前已暂存内容 |
| 按需 | `git commit -a -m "说明"` | 自动暂存已跟踪文件的修改和删除后提交；`-a` **不包含新文件** |

### 一个最小而可靠的提交循环

```bash title="commit-changes.sh"
git status -sb
git diff

# -p：按修改块选择；常用输入 y 接受、n 跳过、s 拆分、q 退出
git add -p

# 新文件不会被普通 add -p 自动纳入，单独添加
git add src/login.test.ts

git diff --staged
# 在这里运行项目的测试、类型检查或 lint
git commit -m "feat: 增加登录失败提示"
```

`git add .` 仅覆盖当前目录及其子目录；`git add -A` 默认覆盖整个仓库。不要因为方便而把密钥、环境文件或临时产物一并提交。

### 补交遗漏文件或修改说明

```bash title="amend-local-commit.sh"
# 仅适用于刚创建、尚未共享的最近一次提交
git add src/login.test.ts
git commit --amend --no-edit

# 如果只想改说明：先确保暂存区没有不想纳入的修改
# -m 提供新的提交说明
git commit --amend -m "feat: 增加登录校验与测试"
```

`amend` 是改写历史[^rewrite]，不是在旧提交上附加一层。已经推送并被他人使用的提交，通常补一个新提交更安全。

## 3. 创建、切换与清理分支

**场景：** 隔离功能开发、修复线上问题、检查同事分支。创建分支只是增加一个引用，不会复制一份项目文件；需要多个独立目录时使用 [worktree](#worktree)。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 高频 | `git switch <分支>` | 切换到已有本地分支 |
| 高频 | `git switch -c <新分支>` | 从当前提交创建并切换；`-c` 表示创建 |
| 常用 | `git switch -c <新分支> origin/main` | 从本地记录的远端主分支创建；使用前先 fetch |
| 常用 | `git branch -vv` | 查看本地分支、上游和最近提交；`-vv` 输出更详细的跟踪信息 |
| 常用 | `git switch --track origin/<分支>` | 创建并切换同名本地分支，同时设置远端上游；`--track` 建立跟踪关系 |
| 常用 | `git switch -` | 回到上一次检出的分支或位置 |
| 常用 | `git branch -d <分支>` | 删除已合并分支；检查目标是其上游，没有上游时是 `HEAD`，不等于保证已进主分支 |
| 按需 | `git branch -m <新名称>` | 重命名当前本地分支；不自动重命名远端分支 |
| 按需 | `git branch -a` | 列出本地分支和远端跟踪分支；`-a` 表示全部 |
| 危险、低频 | `git branch -D <分支>` | 强制删除本地分支引用；`-D` 不要求已经合并 |

### 从 checkout 迁移到 switch / restore {#checkout-switch-restore}

**场景：** 阅读旧教程、维护已有脚本，或将熟悉的 `checkout` 操作迁移到职责更明确的新命令。

Git 2.23 起引入 `switch` 和 `restore`，将 `checkout` 的两类常用职责拆开：

- **`git switch`：切换分支或检出位置**，也能创建分支、进入分离 HEAD 状态。
- **`git restore`：恢复文件内容**，可指定修改工作区、暂存区或两者，不移动当前分支。
- **`git checkout`：仍保留上述两类能力，并未废弃。** 老版本 Git 或已有脚本可以继续使用；本文优先采用新命令，是为了减少歧义，不是因为旧写法失效。

下面按日常使用频率大致排列；文件恢复对应关系以**指定路径在来源中存在的普通已跟踪文件**为前提，删除路径的边界差异见表后说明。

| 常用程度 | 操作 | 传统 checkout 写法 | switch / restore 写法与参数 |
| :-- | :-- | :-- | :-- |
| 高频 | 切换已有分支 | `git checkout main` | `git switch main` |
| 高频 | 创建并切换分支 | `git checkout -b feature/login` | `git switch -c feature/login`；`-b` / `-c` 分别是两条命令的创建选项 |
| 常用 | 从指定起点创建分支 | `git checkout -b feature/login origin/main` | `git switch -c feature/login origin/main`；最后一个参数是起点 |
| 常用 | 回到上次检出位置 | `git checkout -` | `git switch -`；`-` 表示上一次检出位置 |
| 常用 | 从远端跟踪分支创建本地分支 | `git checkout --track origin/feature/login` | `git switch --track origin/feature/login`；`--track` 同时设置上游 |
| 常用、有丢失风险 | 丢弃文件未暂存修改 | `git checkout -- src/login.ts` | `git restore -- src/login.ts`；默认从暂存区恢复工作区，`--` 后按路径解释 |
| 按需、有覆盖风险 | 从某提交恢复文件到暂存区和工作区 | `git checkout HEAD~1 -- src/login.ts` | `git restore --source=HEAD~1 --staged --worktree -- src/login.ts`；`--source` 指定来源，后两个选项指定写入位置 |
| 按需 | 临时查看旧版本 | `git checkout --detach v1.2.0` | `git switch --detach v1.2.0`；`--detach` 显式进入分离 HEAD 状态 |

这里 `HEAD~1` 表示当前提交的第一父提交。对于切换分支的操作，两组命令都可能因覆盖未提交修改而拒绝执行；改用 `switch` 并不意味着会自动保存修改。

**容易混淆的是带版本号的文件恢复：** `git checkout <提交> -- <路径>` 会更新暂存区和工作区，而 `git restore --source=<提交> -- <路径>` 默认只更新工作区，不能不加区别地替换。

```bash title="checkout-restore-comparison.sh"
# 以下是对照示例，按目的选择，不要依次全部执行

# 旧写法：从上一提交恢复文件，同时更新暂存区和工作区
# git checkout HEAD~1 -- src/login.ts

# 新写法：明确同时更新暂存区和工作区，效果对应上面的常见用法
# --source：来源；--staged：写入暂存区；--worktree：写入工作区
git restore --source=HEAD~1 --staged --worktree -- src/login.ts

# 如果只想取回旧文件，在审查后再自行决定是否暂存：
# git restore --source=HEAD~1 -- src/login.ts

# 如果只是取消暂存、保留工作区编辑，不要使用 checkout -- 文件：
# git restore --staged -- src/login.ts
```

另一个边界差异是 **overlay（覆盖但不主动删除来源中缺失的文件）**：`checkout` 默认采用这种模式；`restore` 默认不采用，因此恢复一组路径时，会删除其中已跟踪、但来源快照里不存在的路径，以对齐来源。需要保留这类路径时，可显式使用 `git restore --overlay ...`。批量恢复目录前应先核对来源和范围，不能把整条旧命令机械替换。

可简单记为：**切分支用 switch，恢复文件用 restore；看到 checkout 时，先判断它是在切换检出位置，还是在覆盖文件。** 进一步的撤销选择见[撤销、回退合并与找回提交](#undo)。

### 从最新主分支开始新功能

```bash title="create-feature-branch.sh"
# 获取远端最新引用，不修改当前工作区
git fetch origin

# -c 创建并切换；起点明确使用 origin/main
git switch -c feature/login origin/main

# 避免新功能分支沿用 origin/main 作为上游
# -u 在首次推送后把 origin/feature/login 设置为上游
git push -u origin feature/login
```

Git 可能按 `branch.autoSetupMerge` 的设置，把起点 `origin/main` 自动设为新分支上游；首次推送时显式指定分支并使用 `-u`，可以明确最终跟踪关系。

有未提交修改时，Git 可能允许带着修改切换，也可能因覆盖风险拒绝。不要靠强制切换解决；先提交、stash，或另建 worktree。

### 查看历史版本而不误提交

```bash title="inspect-old-version.sh"
# --detach：检出提交但不让 HEAD 指向某个分支
git switch --detach v1.2.0

# 如果决定在这里继续修改，先建立分支承接后续提交
git switch -c fix/legacy-login
```

分离 HEAD[^detached] 适合临时查看、测试旧版本；若已在该状态提交，离开前创建分支保存提交。

## 4. 克隆、同步与推送

**场景：** 获取项目、同步同事的提交、发布自己的分支。理解 `fetch` 和 `pull` 的区别，比记住一条万能 `pull` 更重要。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 高频 | `git fetch origin` | 更新远端跟踪引用，不自动合并、不改工作区 |
| 高频 | `git pull --ff-only` | 获取并仅允许快进[^ff]更新；发生分叉就失败，不自动生成合并提交 |
| 高频 | `git push` | 按上游及推送配置发送提交；首次推送应显式指定远端与分支 |
| 常用 | `git push -u origin <分支>` | 推送并设置上游；`-u` 是 `--set-upstream` |
| 常用 | `git clone <地址>` | 克隆仓库，通常自动配置名为 origin 的远端 |
| 常用 | `git remote -v` | 查看远端获取、推送地址；`-v` 显示地址详情 |
| 常用 | `git fetch --prune origin` | 获取并清理远端已删除分支对应的本地跟踪引用；不会删除本地工作分支 |
| 按需 | `git remote add upstream <地址>` | 增加一个远端；fork 工作流通常用 upstream 表示原仓库 |
| 按需 | `git remote set-url origin <地址>` | 修改已有远端地址，例如从 HTTPS 切换为 SSH |
| 按需 | `git branch --set-upstream-to=origin/<分支>` | 修改当前分支上游；只设置关系，不执行推送 |
| 按需 | `git push origin --delete <分支>` | 删除远端分支；先确认团队不再使用 |
| 初始使用 | `git init -b main` | 在当前目录初始化；`-b` 设置初始分支名 |

### 克隆已有项目与发布新项目

```bash title="clone-or-publish.sh"
# 方案一：已有远端项目；末尾 app 是本地目录名称
git clone git@github.com:example/app.git app
cd app

# 方案二：在另一个现有项目目录执行，不与上面的克隆步骤连跑
# 远端仓库应为空；如果已有 README 等提交，先克隆再拷入项目更稳妥
# git init -b main
# git add .
# git commit -m "chore: 初始化项目"
# git remote add origin git@github.com:example/new-app.git
# git push -u origin main
```

### 同步时先判断有没有分叉

```bash title="sync-branch.sh"
git fetch origin

# 左边数字：仅本地拥有的提交数；右边：仅上游拥有的提交数
# --left-right 区分两侧；--count 只输出数量；@{u} 是当前分支上游
git rev-list --left-right --count 'HEAD...@{u}'

# 本地没有独有提交时，可以快进更新
git pull --ff-only
```

- 只有右侧大于 0：本地落后，通常可以快进。
- 只有左侧大于 0：本地领先，检查后推送。
- 两侧都大于 0：历史分叉，按团队约定选择 merge 或 rebase，不能通过普通快进解决。
- 没有上游：`@{u}` 会报错，先显式设置上游或直接比较 `HEAD...origin/目标分支`。

`git pull` 本质上是获取后再整合，具体采用 merge 还是 rebase 会受配置影响。日常更建议显式写出策略，尤其不要在不清楚上游是谁时直接 pull。

### 推送被拒绝怎么办

普通的「non-fast-forward」拒绝通常意味着远端已有新提交：先 fetch，审查差异，再合并或变基，不要立即强推。权限不足、保护分支、服务端检查失败则不是同步命令能解决的问题。

个人分支执行 rebase / amend 后确实需要改写远端时，见[带保护的强制推送](#force-push)。

## 5. 合并分支与创建合并请求 {#merge}

**场景：** 把功能交付到主分支，或把主分支更新引入功能分支。

**PR / MR 是平台上的评审请求，`git merge` 是本地历史操作。** Git 本身没有通用的 `git pr` / `git mr` 命令，也不会因为执行了 merge 就创建平台请求。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 高频 | `git merge <来源分支>` | 将来源整合到当前分支；允许时默认可快进，否则创建合并提交 |
| 常用 | `git merge --ff-only <来源分支>` | 只接受快进，不允许分叉合并；适合同步本地 main |
| 常用 | `git merge --no-ff <来源分支>` | 即使可快进也创建合并提交，保留一次分支整合边界 |
| 常用 | `git merge --abort` | 放弃尚未完成的合并；开始前工作区应干净，避免恢复困难 |
| 按需 | `git merge --continue` | 冲突全部暂存后，继续并完成合并提交 |
| 按需 | `git merge --squash <来源分支>` | 将合并结果放入工作区/暂存区，随后手动 commit；不记录双亲合并关系 |
| 按需 | `git merge --no-ff --no-commit <来源分支>` | 准备普通合并结果但暂停提交，便于检查；`--no-commit` 单独使用不能阻止快进 |

### 先明确方向：站在目标分支上合并来源

```text title="merge-direction.txt"
feature/login ── 合并到 ──> main
                           ↑
                  执行 merge 时所在分支
```

```bash title="merge-feature.sh"
# 前提：工作区干净，且团队允许直接推送 main
git fetch origin
git switch main
git merge --ff-only origin/main

# 确认这里的本地 feature/login 就是要合入的版本
# --no-ff 强制保留合并提交；-m 设置该提交的说明
git merge --no-ff feature/login -m "merge: 合入登录功能"

# 运行测试，确认合并结果后再推送
git push origin main
```

如果要合入的是同事已推送的版本，可以在 fetch 后将来源明确写为 `origin/feature/login`。本地分支不一定与同名远端跟踪分支同步。

### 创建 PR / MR：日常更推荐的团队流程

1. 在功能分支提交，并执行 `git push -u origin feature/login`。
2. 在 GitHub 创建 Pull Request、GitLab 创建 Merge Request，或在 Bitbucket 创建 Pull Request。
3. 确认**源分支**是 `feature/login`，**目标分支**是 `main`；填写变更范围、验证结果和风险。
4. 等待 CI 与评审通过，在平台执行合并；保护分支通常要求这一步而非直接 push。
5. 本地切回 main 并快进同步，再清理已完成的分支。

如果已另行安装并登录 GitHub CLI / GitLab CLI，也可在仓库目录中使用：

```bash title="create-review-request.sh"
# GitHub CLI，不是 Git 内置命令
# --base 指定目标分支，--head 指定源分支
# --title 为标题，--body 为请求描述
gh pr create --base main --head feature/login \
  --title "增加登录校验" --body "包含输入校验及回归测试"

# GitLab CLI：与上面二选一，按所在平台执行
# --source-branch 为源分支，--target-branch 为目标分支
# --title 为标题，--description 为请求描述
glab mr create --source-branch feature/login --target-branch main \
  --title "增加登录校验" --description "包含输入校验及回归测试"
```

Bitbucket 可直接使用网页创建；不同平台 API 与 CLI 不统一，不需要为了提交 PR 更换 Git 工作流。

### 三种合并方式如何选

| 方式 | 历史结果 | 合适场景与后续影响 |
| :-- | :-- | :-- |
| Merge commit | 保留原提交，并创建有两个父提交的合并提交 | 保留分支边界；整次撤销通常使用 `revert -m` |
| Squash merge | 把一批修改压成目标分支上的一个普通提交 | 功能分支提交较碎；撤销该普通提交即可，但 Git 不记录原分支已合并关系 |
| Rebase 后快进 | 将功能提交重放到新基点，形成线性历史 | 希望保留多个干净提交；会改写被重放提交的哈希 |

平台的 Rebase and merge 等功能可能有额外规则，以团队约定为准。Squash 后 `git branch -d` 可能仍判断原分支未合并；不要直接盲用 `-D`，先核对 PR 和实际代码结果。

## 6. 处理冲突与 rebase 更新

**场景：** 多人修改同一片代码，或个人分支需要追上主分支。冲突不是「Git 出错」，而是需要人决定最终内容。

### 6.1 通用冲突处理

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 高频 | `git status` | 查看当前是 merge、rebase 还是 cherry-pick，以及未解决路径 |
| 高频 | `git diff --name-only --diff-filter=U` | 只列未合并路径；`--name-only` 仅输出路径，`U` 表示未合并 |
| 高频 | `git add <已解决路径>` | 将手工解决后的内容标记为已解决 |
| 常用 | `git diff --check` | 检查新增冲突标记及空白错误；退出码非零时应检查输出 |
| 常用 | `git diff --staged --check` | 对已暂存差异做同样检查；适合 add 之后使用 |
| 常用 | `git rm <路径>` | 解决「最终应删除此文件」的冲突，并暂存删除 |
| 按需 | `git restore --ours -- <路径>` | 把索引中的 ours 版本写入工作区；仍需 add，不适用于所有冲突形态 |
| 按需 | `git restore --theirs -- <路径>` | 把索引中的 theirs 版本写入工作区；仍需 add |
| 按需 | `git mergetool` | 调用已配置的三方合并工具[^threeway]，详见工具配置章节 |

普通 merge 中的冲突标记示例：

```text title="conflict-example.txt"
<<<<<<< HEAD
const timeout = 3000;
=======
const timeout = 5000;
>>>>>>> feature/login
```

处理步骤：

1. 阅读两侧修改及上下文，决定保留一侧、组合两侧还是重新实现。
2. 删除冲突标记，留下最终代码。出现 `|||||||` 时，那是 diff3 / zdiff3 模式展示的共同祖先。
3. 运行测试，检查接口和行为是否兼容；「没有文本冲突」不代表「没有逻辑冲突」。
4. `git add` 或 `git rm` 标记处理完成。
5. 根据当前操作执行对应的 continue；想整体放弃则执行对应 abort。

| 当前操作 | 解决后继续 | 放弃本轮操作 |
| :-- | :-- | :-- |
| merge | `git merge --continue` | `git merge --abort` |
| rebase | `git rebase --continue` | `git rebase --abort` |
| cherry-pick | `git cherry-pick --continue` | `git cherry-pick --abort` |
| revert | `git revert --continue` | `git revert --abort` |

```bash title="resolve-merge.sh"
# 假设 merge 已因冲突暂停
git status
git diff --name-only --diff-filter=U

# 在编辑器中修改文件，然后检查并暂存
git diff --check
git add src/config.ts
git diff --staged --check
git diff --staged

# 完成合并；如果测试尚未运行，此时先运行测试
git merge --continue
```

::: warning 不要机械选择 ours / theirs

普通 merge 时，ours 通常是当前目标分支，theirs 是被合入分支。**rebase 时，ours 是新基点及已经重放的结果，theirs 是当前正在重放的原分支提交**，与「ours 就是我自己写的代码」的直觉可能相反。只有明确要整份采用某一侧文件时才使用这两个选项；删除/修改冲突也可能没有对应侧的文件版本。

:::

### 6.2 用 rebase 更新个人分支

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git rebase origin/main` | 将当前分支的独有提交重放到 origin/main 之后 |
| 常用 | `git rebase --continue` | 解决并暂存当前冲突后，继续重放 |
| 常用 | `git rebase --abort` | 回到此次 rebase 开始前的状态 |
| 按需 | `git rebase -i HEAD~3` | 交互整理最近 3 个提交；`-i` 为交互模式，`~3` 沿第一父链向前 3 步 |
| 谨慎使用 | `git rebase --skip` | 丢弃当前正在重放的整个提交；不是「忽略冲突继续保留修改」 |

```bash title="rebase-personal-branch.sh"
# 前提：工作区干净，分支由自己维护
git switch feature/login
git fetch origin

# 建一个本地备份引用，便于对照和恢复
git branch backup/login-before-rebase

git rebase origin/main

# 若暂停：编辑冲突文件 → git add 对应文件 → git rebase --continue
# 可能需要重复多轮；不要用普通 git commit 代替 rebase --continue
```

rebase 不会修改 `origin/main` 指向的远端跟踪历史，而是重写当前分支的提交。多人共用的分支通常采用 merge 更新，或先明确协调历史改写。

### 6.3 整理提交再送审

运行 `git rebase -i HEAD~3` 后，编辑器中按从旧到新的顺序列出提交：

```text title="rebase-todo.txt"
pick a1b2c3d 增加登录接口
reword b2c3d4e 补充说明
fixup c3d4e5f 修复拼写
```

- `pick`：保留此提交。
- `reword`：只修改提交说明。
- `fixup`：把此提交合入前一个保留提交，并丢弃本提交说明；这里会合入第二条。
- `squash`：同样合入前一个保留提交，但会让你整理合并后的说明。
- `drop`：删除该提交，谨慎使用。

该示例假设第一父链上至少存在 3 个可整理提交；普通 rebase 默认不会保留原有 merge 拓扑，复杂合并历史不要直接套用这组命令。

### 6.4 带保护的强制推送 {#force-push}

::: caution 强推前确认分支归属

`--force-with-lease` 比 `--force` 多了一层远端状态检查，但不是协作授权，也不保证不会丢失你已经看到却没有整合的他人提交。只对已协调的个人分支使用；不要对共享主分支套用。

:::

下面给出带**显式预期哈希**的版本。它是完整的替代流程，预期值必须在改写前记录，不是 rebase 完才补记：

```bash title="push-rewritten-branch.sh"
git switch feature/login
git fetch origin

# --verify 验证引用存在；变量保存此刻观察到的远端分支尖端
expected=$(git rev-parse --verify refs/remotes/origin/feature/login)

# 先确认远端没有本地尚未纳入的提交；有输出就先停下并整合
# --oneline 每条一行；HEAD..origin/feature/login 只看远端独有提交
git log --oneline HEAD..origin/feature/login

# 确认没有遗漏他人提交后，再备份、改写、运行测试
git branch backup/login-before-rewrite
git rebase origin/main

# 仅在远端仍精确等于 expected 时允许覆盖
# HEAD:refs/heads/feature/login 明确指定本地来源和远端目标
git push --force-with-lease="refs/heads/feature/login:$expected" \
  origin HEAD:refs/heads/feature/login
```

若 lease 检查失败，说明远端在此期间变了，重新 fetch 并审查，不要改用 `--force`。简写 `git push --force-with-lease` 依赖本地远端跟踪引用作为预期值，后台自动 fetch 可能刷新这个预期，所以显式记录更可控。

## 7. 撤销、回退合并与找回提交 {#undo}

**场景：** 撤销未提交修改、拆掉错误提交、回退已上线功能，或找回误 reset / rebase 的历史。先区分「修改文件」「移动分支」「创建反向提交」。

### 7.1 先按状态选择工具

| 常用程度 | 需求 | 命令 | 影响 |
| :-- | :-- | :-- | :-- |
| 高频 | 取消暂存 | `git restore --staged <路径>` | 改暂存区，保留工作区 |
| 常用 | 丢弃某文件未暂存修改 | `git restore <路径>` | 默认用暂存区覆盖工作区；修改通常无法找回 |
| 常用 | 撤销已共享的普通提交 | `git revert <提交>` | 新建一个反向提交，不删除原历史 |
| 常用 | 撤掉本地最近提交，保留暂存 | `git reset --soft HEAD~1` | 移动当前分支，暂存区和工作区不变 |
| 常用 | 撤掉本地最近提交，重新挑选修改 | `git reset --mixed HEAD~1` | 移动分支并重置暂存区，保留工作区；`--mixed` 是默认模式 |
| 按需 | 查找本地引用曾经的位置 | `git reflog` | 用于定位误操作前提交，不直接恢复文件 |
| 按需 | 恢复历史版本中的某个文件 | `git restore --source=<提交> -- <路径>` | 只更新工作区，不移动分支；`--source` 指定来源 |
| 高风险 | 连同已跟踪修改一起丢弃 | `git reset --hard <提交>` | 移动分支并重置暂存区、工作区；还可能删除阻挡检出的未跟踪路径 |

::: caution 先检查、再备份、最后撤销

执行破坏性命令前先运行 `git status`、`git diff`、`git diff --staged`。`git branch backup/before-reset` 只能保护已提交历史，**不能保护未提交修改**；未提交内容应先提交到临时分支、stash 或另行复制。密钥等敏感文件不要为了备份而提交到仓库。

:::

### 7.2 reset 的三种模式

假设最近一次提交尚未共享，要回到它的父提交，以下三条**只选一条**：

```bash title="reset-local-commit.sh"
# HEAD~1：沿第一父链回退一个提交
# --soft：撤掉提交，但修改仍处于已暂存状态
git reset --soft HEAD~1

# --mixed：撤掉提交，修改变为未暂存，适合重新拆分提交
# git reset --mixed HEAD~1

# --hard：连同相关未提交修改一起丢弃；确认有备份再使用
# git reset --hard HEAD~1
```

| 模式 | 当前分支指针 | 暂存区 | 工作区 |
| :-- | :-- | :-- | :-- |
| `--soft` | 移到目标提交 | 不变 | 不变 |
| `--mixed` | 移到目标提交 | 与目标一致 | 不变 |
| `--hard` | 移到目标提交 | 与目标一致 | 已跟踪内容与目标一致，存在额外路径删除风险 |

`reset --hard` 不是清理所有未跟踪文件的工具；一般未跟踪文件仍会保留。但它也不是「绝不影响未跟踪文件」，不要据此冒险。

### 7.3 revert 普通提交：适合已推送历史

```bash title="revert-published-commit.sh"
git switch main
git pull --ff-only

# 创建回退分支，按团队流程通过 PR / MR 合入
git switch -c revert/login-validation

# a1b2c3d 替换为要撤销的普通提交哈希
git revert a1b2c3d

# 发生冲突时，编辑文件并 git add，然后 git revert --continue
# 不想继续则 git revert --abort

git push -u origin revert/login-validation
```

revert 撤销的是该提交引入的改动，而不是把整个仓库恢复到那一天的快照；后续相邻修改可能导致冲突。Squash merge 生成的单个普通提交，也按这种方式撤销。

### 7.4 回退一次 merge：先确认主线父提交

普通双亲 merge 有两个父提交[^parent]。`git revert -m 1 <合并提交>` 的 `-m` 是 **mainline（主线父编号）**，不是提交说明，也不是「撤销第一个父提交」。它表示保留相对第 1 个父提交的主线方向，反转 merge 相对该父提交引入的差异。

```bash title="revert-merge.sh"
# 先查看合并提交及父提交，a1b2c3d 替换为实际 merge 哈希
# -s 不输出补丁；%H 为提交哈希，%P 为按顺序排列的父哈希，%s 为标题
# %n 表示换行
git show -s --format='%H%n%P%n%s' a1b2c3d

# 分别查看相对两个父提交引入的内容，确认真正的主线方向
# ^1 / ^2 分别选择第一个 / 第二个父提交
git diff a1b2c3d^1 a1b2c3d
git diff a1b2c3d^2 a1b2c3d

# 确认父 1 是希望保留的主线后，在回退分支上执行
git revert -m 1 a1b2c3d
```

在 main 上运行 `git merge feature/login` 生成的 merge，父 1 通常是合并前的 main，父 2 是功能分支尖端；仍然应该检查，不能只凭分支名称猜测。

::: warning 回退 merge 不会抹掉「曾经合并过」的关系

revert 只反转内容，原 merge 仍在历史里。再次合并同一个功能分支，不会自动把已撤销的旧改动重新带回来，Git 可能提示已经是最新。

若要恢复原功能，常见做法是**撤销那次 revert 提交**，再合入修复；也可以在新分支重新组织需要的改动。不要只推一个小修复提交就假设整个旧功能会随 merge 恢复。

:::

```bash title="restore-reverted-feature.sh"
# b2c3d4e 是前一步产生的普通 revert 提交，不是原 merge 提交
# 对它再次 revert，通常不需要 -m
git revert b2c3d4e
```

### 7.5 用 reflog 找回误删或误回退提交

```bash title="recover-with-reflog.sh"
# --date=local 按本地时区显示引用移动时间
git reflog --date=local

# 找到误操作前的哈希后，先建立救援分支，不直接覆盖当前工作区
git branch rescue/lost-work a1b2c3d

git show a1b2c3d
git switch rescue/lost-work
```

reflog[^reflog] 是本地记录，不等于远端备份，也不是永久存档；记录会过期，不可达对象可能被垃圾回收。它主要找回**曾经提交过的内容**，无法保证恢复被 `restore` / `reset --hard` 丢掉的未提交编辑。

## 8. 临时搁置工作：stash

**场景：** 临时切换任务、同步前保存半成品。长时间并行开发优先考虑 worktree，不要把 stash 当作长期备份。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git stash push -u -m "说明"` | 保存已跟踪修改和未跟踪文件；`-u` 包含未跟踪但不含被忽略文件，`-m` 设置说明 |
| 常用 | `git stash list` | 查看 stash 列表，最新条目为 `stash@{0}` |
| 常用 | `git stash pop` | 应用最新 stash，成功后删除该条；冲突时通常保留条目 |
| 常用 | `git stash apply 'stash@{0}'` | 应用指定条目但不删除，适合先验证再清理 |
| 按需 | `git stash show -p -u 'stash@{0}'` | 查看补丁；`-p` 展示内容，`-u` 同时展示保存的未跟踪文件 |
| 按需 | `git stash apply --index 'stash@{0}'` | 尝试同时恢复原来的暂存状态；冲突时可能失败 |
| 按需 | `git stash drop 'stash@{0}'` | 删除指定条目；确认内容已经恢复后再执行 |
| 按需 | `git stash branch <新分支> 'stash@{0}'` | 从保存时的基点创建分支并恢复，成功后删除对应条目，适合原分支已变化很多时 |

```bash title="pause-work.sh"
git stash push -u -m "登录页面开发中，临时修复生产问题"
git switch main

# 完成另一项工作后返回
git switch feature/login

# 先恢复、检查，再删除，比直接 pop 更容易核对
git stash apply 'stash@{0}'
git status
# 确认恢复成功且期间没有新建 stash，才删除原条目
git stash drop 'stash@{0}'
```

默认 stash 不包含未跟踪文件；`-u` 不包含忽略文件，`-a` 才包含二者，但可能把体积巨大的依赖目录或敏感环境文件也收进去，应避免随手使用。

stash 冲突后按文件解决并 add，**没有 `git stash --continue` 或 `git stash --abort`**。如果要放弃恢复，需要区分恢复前就存在的修改；只有确认恢复前工作区干净且 stash 仍保留时，才考虑有针对性地恢复文件，不能盲目 `reset --hard`。

## 9. 多目录并行开发：worktree {#worktree}

**场景：** 主功能尚未完成时紧急修 bug，同时运行多个版本做对照，或保持一个稳定目录用于评审、构建。相比反复 stash / switch，worktree 给同一仓库增加多个独立工作目录。

各工作树有各自的工作区、暂存区和 HEAD，但共享对象库、大部分引用以及默认仓库配置[^worktree]，不是完全隔离的仓库副本。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git worktree add -b <新分支> <目录> origin/main` | 从指定起点创建新分支和工作树；`-b` 创建分支 |
| 常用 | `git worktree add <目录> <已有分支>` | 将已有本地分支检出到新目录 |
| 常用 | `git worktree list` | 列出工作树路径、提交和检出状态 |
| 常用 | `git worktree remove <目录>` | 移除干净的关联工作树；有修改或未跟踪文件时通常会拒绝 |
| 按需 | `git worktree add --detach <目录> <提交>` | 创建分离 HEAD 工作树，用于只读检查或测试历史版本 |
| 按需 | `git worktree move <旧目录> <新目录>` | 移动关联工作树并维护元数据；主工作树及含子模块的工作树有使用限制 |
| 按需 | `git worktree prune --dry-run` | 预览可清理的失效管理记录；`--dry-run` 不真正删除 |
| 按需 | `git worktree prune` | 清理失效管理记录，不是删除有效工作目录；受过期策略影响 |
| 按需 | `git worktree lock --reason "说明" <目录>` | 锁定管理记录，防止移动硬盘等暂不可达工作树被清理；`--reason` 记录原因 |
| 按需 | `git worktree unlock <目录>` | 解除管理锁定，不是文件写锁 |
| 修复时 | `git worktree repair <目录>` | 手动移动目录后修复关联记录；正常移动优先使用 move |

### 主目录继续开发，旁边开目录处理紧急修复

```bash title="parallel-hotfix.sh"
# 当前位于主仓库，例如 ~/projects/app
git fetch origin

# -b 创建修复分支；../app-hotfix 是独立的相邻目录
git worktree add -b hotfix/login-timeout ../app-hotfix origin/main

git worktree list
cd ../app-hotfix

# 该目录拥有自己的文件与暂存区，不影响原目录的未提交修改
# 在这里安装项目依赖、修改代码并运行测试
git add src/login.ts
git commit -m "fix: 修复登录超时"
git push -u origin hotfix/login-timeout

# 在平台创建 PR / MR，完成评审与合并
```

工作完成后，从保留的主目录进行清理：

```bash title="cleanup-worktree.sh"
# 在原仓库目录运行；路径仍以该目录为参照
git -C ../app-hotfix status --short
# -C 表示先进入指定目录再执行 Git 命令；--short 显示简洁状态

# 移除工作树不会同时删除分支
git worktree remove ../app-hotfix

# 更新并检验 main，确认 PR 已合入后再尝试删除分支
git fetch origin
git switch main
git merge --ff-only origin/main
git branch -d hotfix/login-timeout
```

注意：

- 默认不能在两个工作树同时检出同一个本地分支；需要并行检查同一版本时用 `--detach`，不要强行绕过保护。
- `node_modules`、虚拟环境、构建缓存不会自动共享；运行多个服务还要区分端口、环境配置和本地数据库。
- fetch 更新共享的远端跟踪引用，但不会自动更新另一个工作树里的文件。
- stash 列表也是共享的，写清说明，避免在另一个目录误恢复。
- 删除前检查未跟踪、被忽略但仍有价值的文件，例如 `.env`、本地数据和构建产物；`worktree remove` 不是备份工具。
- 不要直接 `rm -rf` 代替正常 remove；误删后可用 prune 清理残留记录。remove 不会删除主工作树。

## 10. 挑选提交、标签与问题定位

**场景：** 向维护分支移植单个修复、标记发布版本、确定哪次改动引入回归。相较前面章节，这些命令通常按需使用。

### 10.1 cherry-pick：只带走需要的提交

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git cherry-pick <提交>` | 将指定提交的改动应用到当前分支，通常产生新提交 |
| 常用 | `git cherry-pick -x <提交>` | 同上，并在提交说明中记录来源哈希，适合跨发布分支追踪 |
| 按需 | `git cherry-pick <旧提交> <新提交>` | 按给定顺序挑选多个提交，注意依赖关系 |
| 按需 | `git cherry-pick --no-commit <提交>` | 仅应用改动到工作区和暂存区，不立即提交；等同 `-n` |
| 冲突时 | `git cherry-pick --continue` | 解决冲突并暂存后继续；放弃使用 `--abort` |

```bash title="backport-fix.sh"
git fetch origin
# 从维护分支新建修复分支
git switch -c backport/login-fix origin/release/1.x

# -x 将原提交哈希附加到提交说明
git cherry-pick -x a1b2c3d

# 检查依赖、运行测试，再推送发起面向 release/1.x 的 PR / MR
git push -u origin backport/login-fix
```

挑选提交不等于合并整个分支，也不会记录「原分支已合并」的关系。不要只挑修复代码却漏掉它依赖的接口变更。

### 10.2 tag：给发布提交一个稳定名字

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git tag --list 'v1.*'` | 按模式列出标签；引号避免 shell 先展开通配符 |
| 常用 | `git show v1.2.0` | 查看标签和对应提交 |
| 发布时 | `git tag -a v1.2.0 -m "发布 1.2.0"` | 在当前 HEAD 建附注标签[^tag]；`-a` 启用附注，`-m` 设置说明 |
| 发布时 | `git push origin v1.2.0` | 只推送这个标签；普通分支 push 不保证会推送标签 |
| 按需 | `git fetch origin tag v1.2.0` | 显式获取指定标签及所需对象 |
| 谨慎使用 | `git tag -d v1.2.0` | 仅删除本地标签；`-d` 表示删除 |
| 谨慎使用 | `git push origin :refs/tags/v1.2.0` | 删除远端标签；空来源 refspec[^refspec] 表示删除目标引用 |

标签不会随分支移动。已经发布的版本标签通常不应重打或修改，发现问题发布新版本更可靠。若仓库使用 release-please 等自动发布工具，应让流水线管理标签，避免手工与自动化竞争。

### 10.3 bisect：二分查找引入问题的提交

| 执行顺序 | 命令 | 用途 |
| :-- | :-- | :-- |
| 开始 | `git bisect start` | 开始二分定位会话 |
| 标坏 | `git bisect bad` | 当前检出的版本存在问题 |
| 标好 | `git bisect good <提交>` | 给定一个确定正常的历史提交 |
| 迭代 | `git bisect good` / `git bisect bad` | 验证 Git 选出的版本，反复标记直到定位 |
| 自动化 | `git bisect run <测试命令>` | 用命令退出码自动判断 |
| 结束 | `git bisect reset` | 结束并返回开始前的位置；不是普通的 `git reset` |

本表按实际执行流程排列，避免把依赖顺序拆散。最好在干净的专用 worktree 中执行：

```bash title="bisect-regression.sh"
git bisect start
git bisect bad HEAD
git bisect good v1.1.0

# 假设此脚本可在候选版本上检查目标问题；bash 是执行程序
git bisect run bash scripts/check-login.sh

git bisect reset
```

测试命令退出码 `0` 表示正常，`1`～`127`（除 `125`）表示有问题，`125` 表示该提交无法测试、跳过。脚本必须针对目标回归，而不是把缺依赖、环境失败都当成 bug；`128` 及以上退出码会让自动定位中止。

## 11. 忽略文件、清理目录与子模块

**场景：** 防止生成文件进入版本库、清理构建残留，或者维护包含独立依赖仓库的项目。

### 11.1 忽略与清理

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git check-ignore -v <路径>` | 查某个未跟踪路径命中了哪条规则；`-v` 显示规则来源及行号 |
| 常用 | `git rm --cached <路径>` | 从版本跟踪中移除但保留本地文件；后续提交记录该删除 |
| 按需 | `git rm -r --cached <目录>` | 递归停止跟踪目录；`-r` 为递归 |
| 清理前 | `git clean -nd` | 预览将删除的未跟踪文件和目录；`-n` 仅预览，`-d` 包含目录 |
| 危险 | `git clean -fd` | 删除未跟踪文件和目录，通常保留忽略文件；`-f` 确认执行 |
| 高风险 | `git clean -ndx` | 预览包括忽略文件在内的清理；`-x` 不采用常规忽略规则，仍不实际删除 |

```text title=".gitignore"
# 依赖与构建输出
node_modules/
dist/

# 本地配置；模板文件仍允许提交
.env
.env.*
!.env.example

# 临时文件
*.log
.DS_Store
```

`.gitignore` 对已跟踪文件不生效。以 `.env` 为例：

```bash title="untrack-local-config.sh"
# 先把 .env 写入 .gitignore，再停止跟踪；本机文件仍保留
git rm --cached .env
git add .gitignore
git commit -m "chore: 停止跟踪本地环境配置"

# 只预览某个目录的清理；-- 分隔路径
# -n 预览、-d 包括目录、-x 连忽略文件也考虑
git clean -ndx -- dist/

# 确认预览无误后，才把 -n 换成 -f
# git clean -fdx -- dist/
```

如果只是个人工具文件，不希望影响团队，可写入 `.git/info/exclude`。全局忽略文件可通过 `git config --global core.excludesFile ~/.gitignore_global` 指定。

**停止跟踪并不会删除历史里的密钥。** 已提交或推送的凭据应先撤销/轮换，再按团队流程清理历史和托管平台缓存；仅删文件、revert 或加忽略规则都不足以消除泄露。

### 11.2 使用带子模块的仓库

子模块[^submodule] 把另一个仓库的特定提交作为依赖，日常更新需要同时处理主仓库与子模块。

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 获取项目 | `git clone --recurse-submodules <地址>` | 克隆时同时初始化并检出子模块；`--recurse-submodules` 包含嵌套子模块 |
| 常用 | `git submodule update --init --recursive` | 按主仓库记录的提交检出依赖；`--init` 初始化，`--recursive` 处理嵌套子模块 |
| 按需 | `git submodule status` | 查看各子模块当前提交及状态 |
| 按需 | `git submodule sync --recursive` | `.gitmodules` URL 变化后同步本地配置，包含嵌套子模块 |

`submodule update` 默认是对齐主仓库记录的提交，不是自动追踪子模块最新分支。若主动升级依赖，要先保证目标提交已推送到子模块远端，再在主仓库 `git add <子模块路径>` 并提交指针变化；否则同事和 CI 可能取不到该提交。

## 12. 身份、行为与仓库级配置 {#configuration}

**场景：** 新电脑初始化、区分公司与个人提交身份、统一编辑器和换行策略。这里的身份是提交署名，**不等于 SSH 登录身份**。

### 12.1 常用配置与检查

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git config --global user.name "你的名字"` | 设置用户级默认提交作者名；`--global` 对当前系统用户生效 |
| 常用 | `git config --global user.email "you@example.com"` | 设置默认作者邮箱；私密邮箱可使用平台提供的 noreply 地址 |
| 常用 | `git config --local user.email "you@company.example"` | 只覆盖当前仓库的邮箱；`--local` 写入仓库配置，要求位于仓库中 |
| 常用 | `git config --show-origin --get user.email` | 查看最终取值及来源；`--show-origin` 显示配置文件位置 |
| 常用 | `git config --list --show-origin --show-scope` | 列出配置、文件来源及作用域；输出可能包含敏感 URL 或凭据，分享前脱敏 |
| 推荐设置 | `git config --global init.defaultBranch main` | 设置新仓库默认初始分支，不重命名已有分支 |
| 推荐设置 | `git config --global pull.ff only` | 默认 pull 仅快进，分叉时显式决定如何整合 |
| 推荐设置 | `git config --global push.default simple` | 默认仅推送当前分支，且检查上游分支名是否匹配 |
| 按需 | `git config --global fetch.prune true` | 每次 fetch 自动清理失效远端跟踪分支 |
| 按需 | `git config --global core.editor "code --wait"` | 使用 VS Code 编辑提交说明；`--wait` 等待编辑窗口关闭 |
| 按需 | `git config --global merge.conflictStyle zdiff3` | 冲突中展示精简的祖先上下文；Git 2.35+，旧版本可用 `diff3` |
| 按需 | `git config --global --unset pull.rebase` | 移除用户级该设置；更高优先级的仓库配置仍可能生效 |

对这里讨论的单值配置，通常优先级是：命令行 `git -c 键=值 ...` > worktree 专属配置（启用时）> 仓库 local > 用户 global > 系统 system；条件包含文件会在包含位置参与解析。先查 `--show-origin`，不要以为设置了 global 就一定生效。

### 12.2 根据目录自动选择提交身份

例如个人仓库放 `~/projects/personal/`，公司仓库放 `~/projects/work/`。编辑用户配置文件时应**合并到已有内容**，不要覆盖其他有效设置。

```ini title="~/.gitconfig"
[user]
    name = 你的名字
    useConfigOnly = true

[includeIf "gitdir:~/projects/personal/"]
    path = ~/.gitconfig-personal

[includeIf "gitdir:~/projects/work/"]
    path = ~/.gitconfig-work
```

```ini title="~/.gitconfig-personal"
[user]
    email = you@example.com
```

```ini title="~/.gitconfig-work"
[user]
    email = you@company.example
```

- `gitdir:` 根据 Git 管理目录匹配；路径末尾 `/` 表示递归匹配目录下的仓库。大小写不敏感匹配可用 `gitdir/i:`。
- `useConfigOnly = true` 防止 Git 猜测身份；要实现「不匹配目录就不能提交」，还需确保其他作用域没有可回退的邮箱。
- 仓库级 `user.email` 可以覆盖条件包含的用户配置。
- worktree 的管理目录在主仓库内部，条件匹配不一定按新工作目录的位置判断。创建 worktree 后也运行 `git config --show-origin --get user.email` 确认。
- 默认 `git config --local` 在多个 worktree 之间共享；确需按工作树区分时，应先了解并启用 `extensions.worktreeConfig`，不要假定 local 等于「当前目录独享」。

### 12.3 换行符与可共享配置

与其让每个人靠不同的 `core.autocrlf` 猜测，不如用仓库里的 `.gitattributes` 明确规则，再由团队审查：

```text title=".gitattributes"
# 自动识别文本，文本工作区默认使用 LF
* text=auto eol=lf

# Windows 批处理脚本使用 CRLF
*.bat text eol=crlf
*.cmd text eol=crlf

# 二进制不做文本转换，也不进行普通文本 diff / merge
*.png binary
*.jpg binary
```

对已有仓库引入规则可能产生大量换行变更。需要归一化时，在干净分支执行 `git add --renormalize .`（`--renormalize` 按新属性重新处理已跟踪文件），检查 `git diff --staged`，单独提交，不要混进业务改动。

### 12.4 少量高价值别名

```bash title="git-aliases.sh"
# alias 后的名称是自定义 Git 子命令；例如后续执行 git st
git config --global alias.st 'status -sb'
git config --global alias.lg 'log --graph --oneline --decorate -20'
git config --global alias.unstage 'restore --staged'
```

这里 `-20` 限制日志为 20 条，其余选项见前文。尽量不要把强推、硬重置、强制清理包装成容易误触的短别名。

## 13. SSH 登录与 GitHub / GitLab / Bitbucket 密钥隔离 {#ssh}

**场景：** 不想每次推送输入 HTTPS 凭据；不同站点使用不同密钥；同一站点的个人与公司账号需要明确分流。

整条链路是：**远端 URL 选择 SSH Host → Host 配置选择私钥 → 平台根据已登记公钥识别账号 → 仓库权限决定是否能读写**。提交邮箱不参与这条认证链路。

### 13.1 为各站点生成独立密钥

先检查 `~/.ssh/` 中已有文件，不覆盖正在使用的私钥。以下示例使用 Ed25519，并建议在交互提示时设置私钥口令。

```bash title="generate-ssh-keys.sh"
# mkdir -p：目录不存在时创建；chmod 700：仅当前用户可访问
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# -t 指定密钥算法；-C 是便于辨识的注释，不决定账号身份
# -f 指定私钥路径；对应公钥自动保存在同路径加 .pub 的文件中
ssh-keygen -t ed25519 -C "个人 GitHub" -f ~/.ssh/id_ed25519_github
ssh-keygen -t ed25519 -C "公司 GitLab" -f ~/.ssh/id_ed25519_gitlab
ssh-keygen -t ed25519 -C "Bitbucket 项目" -f ~/.ssh/id_ed25519_bitbucket
```

分别将三个 **`.pub` 文件的完整内容**添加到对应平台账号的 SSH Keys 设置页：GitHub、GitLab、Bitbucket Cloud 均提供账号级公钥管理。自建 GitLab 的入口或算法限制可能由管理员调整。

**私钥文件不能上传到平台、提交进仓库或通过聊天发送。** 平台登记的是公钥；私钥口令用于保护磁盘上的密钥，不是 Git 站点密码。

### 13.2 通过 Host 别名选择密钥

将以下配置合并进 `~/.ssh/config`；具体 Host 块通常放在通用 `Host *` 前面，因为很多 SSH 选项采用先取得的值。

```ssh-config title="~/.ssh/config"
# GitHub 个人账号
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes

# 公司自建 GitLab：替换成实际域名
Host gitlab-work
    HostName gitlab.company.example
    User git
    IdentityFile ~/.ssh/id_ed25519_gitlab
    IdentitiesOnly yes
    # 非默认端口时按管理员提供的值开启
    # Port 2222

# Bitbucket Cloud；自建服务的地址、用户名和端口以管理员配置为准
Host bitbucket-work
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

| 配置项 | 含义 |
| :-- | :-- |
| `Host` | 本地匹配名/别名，写在仓库 SSH URL 中；可以为同一站点定义多个别名 |
| `HostName` | 真正连接的服务器域名；GitLab SaaS 可改为 `gitlab.com` |
| `User git` | 托管平台通常使用统一 SSH 用户 git，不是网页账号名；自建服务以实际配置为准 |
| `IdentityFile` | 本 Host 使用的私钥文件 |
| `IdentitiesOnly yes` | 限制使用显式配置的身份，避免代理中的大量其他密钥抢先尝试；仍应检查是否有其他匹配块追加了 IdentityFile |
| `Port` | 服务器的 SSH 端口，默认 22 |

```bash title="secure-ssh-files.sh"
# 仅当前用户读写配置和私钥；公钥不必保密
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/id_ed25519_github ~/.ssh/id_ed25519_gitlab ~/.ssh/id_ed25519_bitbucket
```

同一 GitHub 上有第二个账号时，生成另一把私钥，新增如 `Host github-work` 的配置，`HostName` 仍为 `github.com`，`IdentityFile` 指向新私钥。然后把新公钥登记到第二个账号，并使用该别名克隆其仓库。

### 13.3 远端地址必须使用别名

```bash title="ssh-remotes.sh"
# GitHub：example 为组织或账号，app 为仓库名
git clone git@github-personal:example/app.git

# GitLab：group/subgroup 按实际命名空间替换
git clone git@gitlab-work:group/subgroup/app.git

# Bitbucket Cloud：替换 workspace 与仓库名
git clone git@bitbucket-work:workspace/app.git

# 已有仓库：在对应仓库目录内修改，不是在任意目录执行
git remote set-url origin git@github-personal:example/app.git
git remote -v
```

`git@github.com:...` 不会匹配 `Host github-personal`。只改 SSH config、不改远端 URL，是多账号分流失败的常见原因。冒号后是仓库路径，不是端口；要指定端口可通过 `Port`，或使用 `ssh://git@主机:端口/仓库路径` 形式。

### 13.4 使用 ssh-agent 缓存解锁后的密钥

```bash title="ssh-agent.sh"
# 仅在当前环境没有可用代理时启动；-s 输出 shell 环境设置
# 不要在每个终端启动脚本里无条件启动一个新代理
eval "$(ssh-agent -s)"

# 将密钥加入代理，按提示输入私钥口令
ssh-add ~/.ssh/id_ed25519_github
ssh-add ~/.ssh/id_ed25519_gitlab
ssh-add ~/.ssh/id_ed25519_bitbucket

# -l 列出当前代理加载的密钥指纹
ssh-add -l
```

macOS / Linux 桌面环境可能已有代理；Windows OpenSSH 通常通过系统 `ssh-agent` 服务管理，不应照搬上述服务启动方式。新版 macOS 系统 OpenSSH 可用 `ssh-add --apple-use-keychain <私钥路径>` 将口令存入钥匙串，该选项不适用于所有 SSH 实现。

### 13.5 验证与排障

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 首次配置 | `ssh -T git@github-personal` | 测试认证；`-T` 不分配伪终端，托管平台通常不提供交互 shell |
| 首次配置 | `ssh -T git@gitlab-work` | 测试 GitLab 别名所选账号 |
| 首次配置 | `ssh -T git@bitbucket-work` | 测试 Bitbucket 认证 |
| 排障 | `ssh -G github-personal` | 输出解析后的 SSH 配置，不连接服务器；检查实际域名、用户、端口和密钥 |
| 排障 | `ssh -vT git@github-personal` | `-v` 输出调试日志，观察尝试了哪把公钥；分享日志前脱敏 |
| 排障 | `git ls-remote origin` | 读取实际仓库远端引用，确认不仅能认证，而且有仓库读取权限 |

首次连接时，**通过平台官方文档或管理员独立核对主机指纹**后再接受。主机密钥[^hostkey] 用于确认服务器身份，与上传到账号的用户公钥不是同一个东西。不要用 `StrictHostKeyChecking no` 消除提示，也不要看到指纹变更就直接删除 `known_hosts` 记录。

认证成功通常会显示欢迎或「不提供 shell」的提示，退出码可能非零；以平台提示为准，再用 `git ls-remote origin` 验证仓库访问。

| 现象 | 优先检查 |
| :-- | :-- |
| `Permission denied (publickey)` | 远端是否使用正确 Host 别名、公钥是否登记到正确账号、IdentityFile 与权限是否正确 |
| `Too many authentication failures` | 是否未限制代理身份；检查 `IdentitiesOnly` 与最终解析出的 IdentityFile 列表 |
| 认证成功但仓库不存在/拒绝访问 | 组织、项目路径、仓库权限、企业 SSO 对密钥的授权；SSH 成功不等于有仓库权限 |
| 连接超时/拒绝连接 | DNS、VPN、防火墙、SSH 端口；不要随意替换成未经官方确认的域名 |
| 仍要求 HTTPS 用户名或令牌 | `git remote -v` 是否仍是 `https://`；HTTP 认证不读取 SSH config |

若使用 HTTPS，应通过系统凭据管理器或团队认可的 Git Credential Manager 管理令牌，避免把 token 写进远端 URL，或用明文 `credential.helper store` 保存敏感凭据。

## 14. 配置外部 diff / merge 工具 {#external-tools}

**场景：** 大文件比较、复杂三方冲突，以及习惯在可视化编辑器中审查修改。`difftool` 用于查看差异，`mergetool` 用于产出解决冲突后的文件，两者不应混为一谈。

### 14.1 常用调用

| 常用程度 | 命令 | 用途与参数 |
| :-- | :-- | :-- |
| 常用 | `git difftool` | 用配置的工具查看工作区与暂存区差异 |
| 常用 | `git difftool --staged` | 查看暂存区与 HEAD 差异 |
| 常用 | `git mergetool` | 对未解决的冲突启动配置的合并工具 |
| 按需 | `git difftool -t vscode HEAD~1 HEAD -- src/login.ts` | `-t` 临时选择工具，比较两个提交里的指定文件 |
| 按需 | `git mergetool -t vscode -- src/config.ts` | 只解决指定文件，且临时选择工具 |
| 排障 | `git difftool --tool-help` | 查看当前 Git 支持/检测到的 diff 工具；`--tool-help` 输出工具帮助 |
| 排障 | `git mergetool --tool-help` | 查看可用 merge 工具；安装状态与操作系统有关 |

### 14.2 VS Code 示例

先确认 `code --version` 可用；macOS 可在 VS Code 命令面板安装 `code` 到 PATH。以下命令写入用户级 Git 配置：

```bash title="configure-vscode-tools.sh"
# 默认外部差异工具名称为 vscode
git config --global diff.tool vscode
# 外层单引号防止当前 shell 提前展开 $LOCAL / $REMOTE
# --wait 等待窗口关闭；--diff 以差异视图打开两份文件
git config --global difftool.vscode.cmd 'code --wait --diff "$LOCAL" "$REMOTE"'

# 默认三方合并工具
git config --global merge.tool vscode
# --merge 接受：两个待合并版本、共同祖先、最终输出文件
# 需要支持 --merge 的较新 VS Code
git config --global mergetool.vscode.cmd 'code --wait --merge "$REMOTE" "$LOCAL" "$BASE" "$MERGED"'

# 不把工具退出码当成「已经正确解决」的唯一依据，保留 Git 的确认步骤
git config --global mergetool.vscode.trustExitCode false

# 保留 .orig 备份，核对结果后再手工清理
git config --global mergetool.keepBackup true
```

| 变量 | 含义 |
| :-- | :-- |
| `$LOCAL` | diff 时是比较的一侧；merge 时通常是当前侧 ours 的临时文件 |
| `$REMOTE` | diff 时是另一侧；merge 时通常是待整合侧 theirs 的临时文件，不一定来自远端服务器 |
| `$BASE` | merge 的共同祖先版本；部分添加/删除冲突可能没有有意义的祖先内容 |
| `$MERGED` | 最终要写入的工作区文件，不是只读预览文件 |

rebase 中 LOCAL / REMOTE 的含义遵循前文的 ours / theirs 规则，不能简单理解为「我的文件 / 同事的文件」。

操作时在工具里完成合并、保存结果并结束等待，返回终端后检查 `git status`、差异和测试。`mergetool` 成功时可能已将结果暂存，必要时再 `git add <路径>`，最后执行当前操作对应的 `--continue`。有退出码不代表逻辑正确。

### 14.3 Meld / Beyond Compare 等工具

先安装相应桌面程序，再查看 `--tool-help` 输出的准确工具名和可用状态。以检测到 Meld 为例：

```bash title="configure-meld-tools.sh"
git config --global diff.tool meld
git config --global merge.tool meld

# 仅在程序不在 PATH 时设置实际可执行文件路径
# git config --global difftool.meld.path /实际安装路径/meld
# git config --global mergetool.meld.path /实际安装路径/meld
```

Beyond Compare、KDiff3、P4Merge 等同理，但工具名、启动参数及平台路径并不统一，不要直接照搬 Meld 的路径设置。带空格的路径需要正确引用。

日常仅使用 `git difftool` 已足够，不建议为了可视化查看而全局设置 `diff.external`：它可能改变普通 `git diff` 及脚本的行为。上述设置不会安装编辑器，也不会自动配置团队其他成员的机器。

## 15. 按问题快速选命令

| 我现在想做什么 | 首选操作 | 关键边界 |
| :-- | :-- | :-- |
| 看下一次提交会包含什么 | `git diff --staged` | 不是不带参数的 diff |
| 新建功能分支 | fetch 后 `git switch -c feature/login origin/main` | 首次 push 显式设置正确上游 |
| 把功能合入 main | 在平台创建 PR / MR，或在 main 执行 merge | 先明确目标和来源；遵守保护分支规则 |
| 取消 add，保留编辑 | `git restore --staged <路径>` | 不需要 reset 整个分支 |
| 丢弃某文件未暂存编辑 | `git restore <路径>` | 来源默认是暂存区，未提交内容可能不可恢复 |
| 修改尚未共享的最近提交 | `git commit --amend` | 会纳入已暂存内容，且改写提交哈希 |
| 撤销线上错误提交 | 新分支上 `git revert <提交>`，再送审 | 保留历史，可能需要解决冲突 |
| 撤销整个 merge | 检查父提交后 `git revert -m 1 <merge提交>` | 主线父编号不能盲猜 |
| 撤掉本地提交重新组织 | `git reset --soft` 或 `--mixed` | 不用于随意改写共享历史 |
| 临时去修 bug | 短时用 stash，持续并行用 worktree | stash 不是长期备份 |
| 找回误 reset 的提交 | reflog 定位，再建 rescue 分支 | 不能保证找回未提交修改 |
| SSH 用错账号 | 检查 URL 别名、`ssh -G`、`ssh -vT` | user.email 与 SSH 身份独立 |
| 清理生成文件 | 先 `git clean -nd -- <路径>` | 包含忽略文件要加 `-x`，实际删除前再次确认 |

## 参考资料与术语

遇到版本差异时，优先使用 `git help <子命令>` 或 `git <子命令> -h`（`-h` 显示简短帮助）核对本机能力。

- [Git 官方命令文档](https://git-scm.com/docs)与 [Pro Git 中文版](https://git-scm.com/book/zh/v2)
- [git-revert：特别注意撤销合并的后续影响](https://git-scm.com/docs/git-revert)
- [git-reset：各种模式的精确定义](https://git-scm.com/docs/git-reset)
- [git-worktree：共享状态与工作树管理](https://git-scm.com/docs/git-worktree)
- [git-config：条件包含与配置作用域](https://git-scm.com/docs/git-config)
- [OpenSSH 客户端配置说明](https://man.openbsd.org/ssh_config)
- [GitHub SSH 连接文档](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [GitLab SSH 使用文档](https://docs.gitlab.com/user/ssh/)
- [Bitbucket Cloud SSH 配置文档](https://support.atlassian.com/bitbucket-cloud/docs/configure-ssh-and-two-step-verification/)
- [VS Code 命令行参数](https://code.visualstudio.com/docs/configure/command-line)

[^head]: HEAD 表示当前检出位置，通常指向当前分支，分支再指向一个提交；分离状态下 HEAD 直接指向提交。
[^index]: 暂存区（index / staging area）记录下一次提交准备采用的内容。工作区是磁盘上的文件，提交则保存一个历史快照。
[^upstream]: 上游是本地分支配置的跟踪目标，常为 `origin/分支名`。远端跟踪分支是上一次 fetch 等操作获得的本地记录，不是服务器实时视图；名为 upstream 的远端又是另一回事。
[^ff]: 快进（fast-forward）指当前提交是目标提交的祖先，只需前移分支引用，不必创建新的合并提交。
[^rewrite]: 改写历史是用新提交替代原提交或移动分支引用的操作。提交内容、父提交、说明等参与哈希计算，修改后通常得到新的标识。
[^detached]: 分离 HEAD 指当前不附着在任何本地分支上。此时可以提交，但若没有新引用承接，离开后这些提交不容易从普通分支列表发现。
[^threeway]: 三方合并同时参考共同祖先（BASE）、当前侧（LOCAL / ours）与另一侧（REMOTE / theirs），据此构造最终结果（MERGED）。
[^parent]: 父提交是当前提交直接基于的历史节点。普通提交通常有一个父提交，merge 通常有两个；`^2` 选择第二父提交，`~2` 则沿第一父链走两步，两者不同。
[^reflog]: 引用日志（reflog）记录本地 HEAD、分支等引用的移动历史，可用于定位 reset、rebase、checkout / switch 前的位置。
[^worktree]: Git 工作树是仓库的一个检出目录。关联工作树与主工作树共享对象库及多数引用，但保留独立的工作区、索引与部分管理状态。
[^tag]: 附注标签（annotated tag）是独立 Git 对象，包含标签作者、时间和说明，可被签名；轻量标签只是指向对象的引用。
[^refspec]: 引用映射（refspec）描述本地与远端引用的对应关系，常见形式为 `来源:目标`；在 push 中，空来源配合目标引用表示删除该远端引用。
[^submodule]: 子模块是嵌入主仓库工作目录中的独立仓库。主仓库记录它的提交指针，而非直接跟踪其中每个文件的内容。
[^hostkey]: SSH 主机密钥由服务器持有，客户端通过指纹和 known_hosts 记录验证服务器身份；用户密钥则用于服务器验证你是谁。
