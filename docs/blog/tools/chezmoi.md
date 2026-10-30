---
title: chezmoi 使用指南：跨机器配置管理与命令速查
createTime: 2026/10/29 11:28:19
tags:
  - chezmoi
  - 配置管理
  - 环境配置
permalink: /blog/uxvjmk0r/
---

## 导读：适用范围与阅读路线

[chezmoi](https://www.chezmoi.io/) 用来管理个人配置文件（dotfiles）：把配置保存到 Git 仓库，在不同机器上按模板生成所需文件，支持 Windows、macOS 和 Linux。

它适合管理**需要版本记录、跨设备复用、存在机器差异的文本配置**，但默认不实时同步，也不会自动收集应用产生的修改。不要直接纳管整个主目录、缓存、数据库或频繁变化的运行状态；安装软件仍需调用 Scoop、Homebrew 等包管理器。

- **第一次使用**：阅读工作方式，再完成[快速开始](#quick-start)。
- **已有配置仓库**：重点看[日常维护](#daily)和[忽略规则与跨平台配置](#rules)。
- **同步 AI 工具配置**：参考 [Pi 示例](#pi-config)；涉及凭据时再读 [age 加密](#encryption)。
- **只想查命令**：直接到[分类命令速查](#commands)。

::: details 与其他方案如何选择

| 方案 | 同步方式 | 多机器差异 | 适合场景与边界 |
| :-- | :-- | :-- | :-- |
| **chezmoi** | Git 保存源文件，执行命令生成并应用 | 内置模板、系统判断、密钥集成 | 跨平台个人配置；不是实时同步或完整备份工具 |
| Git + 手动复制 | 自行维护复制脚本或直接跟踪文件 | 自行维护脚本或分支 | 文件少、需求简单；路径、权限、部署均需自己处理 |
| GNU Stow | 将仓库文件软链接到目标位置，Git 负责跨机传输 | 拆分目录或额外脚本 | Unix 环境、配置大体一致；自身不提供模板或远端同步 |
| yadm | 用 Git 管理主目录下的配置 | 替代文件、模板、加密 | 偏好直接编辑实际文件的 Git 工作流；Windows 通常通过 WSL 使用 |
| Syncthing / OneDrive 等 | 持续同步文件内容 | 排除规则等 | 普通资料共享；不按系统生成配置，需考虑锁文件与并发修改 |
| Ansible | 按清单和任务部署配置、软件及服务 | 变量、模板、角色 | 多主机运维；管理个人 dotfiles 的维护成本相对较高 |

:::

## 一、理解 chezmoi 的工作方式 {#concepts}

### 三类位置与配置流向

| 名称 | 默认位置与内容 | 修改入口 |
| :-- | :-- | :-- |
| **源目录** | `~/.local/share/chezmoi`，Git 跟踪的配置、模板和脚本 | `chezmoi edit <目标文件>`，或直接编辑源目录 |
| **目标目录** | 当前用户主目录，存放应用实际读取的文件 | `chezmoi apply` 写入；应用和用户也可能直接修改 |
| **本机配置** | `~/.config/chezmoi/chezmoi.toml`，保存编辑器、模板变量、加密设置等 | `chezmoi edit-config`，默认不随源仓库同步 |

源目录的位置以 `chezmoi source-path` 的输出为准；本文涉及源目录的相对路径都以它为根。

```text title="workflow.txt"
现有目标文件 ── add ──→ 源目录 ←── Git 提交、推送、拉取 ──→ 远端仓库
                           │
                      模板渲染 / 解密
                           ↓
                       期望的目标状态
                           │ apply
                           ↓
                      应用读取的实际文件
```

chezmoi 默认复制、生成文件，**不会把实际配置替换为软链接**。`edit` 修改的是源文件，`diff` 比较期望内容和实际内容，`apply` 才部署。Git 同步和本机部署是两件事。

### 源文件名怎样映射到目标路径

| 源目录中的相对路径 | 默认目标路径 | 含义 |
| :-- | :-- | :-- |
| `dot_gitconfig` | `~/.gitconfig` | `dot_` 表示文件名以 `.` 开头 |
| `dot_pi/agent/settings.json.tmpl` | `~/.pi/agent/settings.json` | `.tmpl` 表示先渲染模板 |
| `dot_pi/agent/private_models.json.tmpl` | `~/.pi/agent/models.json` | `private_` 限制目标权限，不加密内容 |
| `dot_pi/agent/encrypted_auth.json.age` | `~/.pi/agent/auth.json` | `encrypted_` 表示由 chezmoi 解密部署 |

日常命令通常传**目标路径**，例如 `chezmoi edit ~/.pi/agent/settings.json`，不用手动换算成源文件名。例外如 `edit-encrypted`，接收的是要编辑的密文路径。

## 二、快速开始：从一个文件到第二台机器 {#quick-start}

以下基本命令可在 PowerShell、Bash、Zsh 中使用；存在 Shell 差异时会单独标注。`~` 表示用户主目录，示例路径需换成实际存在的文件。chezmoi 命令行为按 **v2.73.3** 核对。

### 1. 安装

Windows 使用 Scoop；未安装时先参考 [Scoop 使用指南](/blog/scoop-guide/)：

```powershell title="install.ps1"
scoop install git chezmoi
chezmoi --version
```

macOS 使用 Homebrew；Linux 下此示例也要求已安装 Homebrew，其他方式见[官方安装说明](https://www.chezmoi.io/install/)：

```sh title="install.sh"
brew install git chezmoi
chezmoi --version
```

### 2. 初始化并添加一个配置

先选一个不含密钥的文件，例如已存在的 `~/.gitconfig`：

```sh title="init.sh"
chezmoi init
chezmoi source-path
chezmoi add ~/.gitconfig
chezmoi managed
```

其他常见目标：

| 场景 | 示例命令 |
| :-- | :-- |
| Windows PowerShell 配置 | `chezmoi add "$PROFILE"`，文件需先存在 |
| Windows 应用配置 | `chezmoi add "$env:APPDATA/MyApp/settings.json"` |
| macOS / Linux Zsh 配置 | `chezmoi add ~/.zshrc` |
| 编辑器配置目录 | `chezmoi add ~/.config/nvim`；会递归添加，先审核目录内容 |

### 3. 编辑、预览、应用

```sh title="edit-apply.sh"
chezmoi edit ~/.gitconfig
chezmoi diff
chezmoi apply --dry-run --verbose
chezmoi apply --verbose
```

只处理一个文件时，可用 `chezmoi diff ~/.gitconfig` 和 `chezmoi apply ~/.gitconfig`。

### 4. 提交并推送远端

在 GitHub、GitLab 等平台创建一个**空仓库**，建议命名为 `dotfiles`。将 `YOUR_NAME` 替换为账号名：

```sh title="publish.sh"
chezmoi git -- status
chezmoi git -- add .
chezmoi git -- diff --cached
chezmoi git -- commit -m "初始化个人配置"
chezmoi git -- branch -M main
chezmoi git -- remote add origin https://github.com/YOUR_NAME/dotfiles.git
chezmoi git -- push -u origin main
```

`chezmoi git -- ...` 在源目录的 Git 仓库执行命令，无需切换目录。首次提交需配置 Git 用户名和邮箱；推送使用平台支持的凭据或 SSH 认证。

::: warning 私有仓库也不要存明文密钥

提交前检查暂存区。`private_` 只限制目标文件权限，**不加密源文件**。已提交的密钥即使从当前文件中删除，仍可能留在 Git 历史中；泄露后应轮换凭据并处理历史。

:::

### 5. 新设备恢复 {#restore}

先安装 Git 和 chezmoi，准备仓库访问凭据。若配置依赖本机变量、解密私钥或密码管理器，也要先准备好；首次克隆后可以补齐本机变量，再预览和应用。

```sh title="restore.sh"
chezmoi init https://github.com/YOUR_NAME/dotfiles.git
chezmoi diff
chezmoi apply --dry-run --verbose
chezmoi apply --verbose
```

私有仓库也可使用 `git@github.com:YOUR_NAME/dotfiles.git`。先检查源目录中的脚本：`run_` 脚本可能随应用执行。密钥配置的差异输出也可能包含明文，只在受控终端查看。

对**已审阅且可信**的仓库，可用 `chezmoi init --apply <仓库地址>` 合并初始化与应用；首次恢复不建议跳过审阅。

## 三、日常维护 {#daily}

### 先选对修改方向

| 情况 | 操作 | 注意 |
| :-- | :-- | :-- |
| 主动修改配置 | `edit <文件>` → `diff` → `apply` | 编辑源文件，再部署 |
| 应用或自己改了实际文件 | `re-add <文件>` | 收回普通文件的修改；跳过模板，保留已有加密属性 |
| 把实际改动合入模板 | `merge <文件>` | 手动审阅合并结果，不会自动反推模板表达式 |
| 放弃实际文件的本地改动 | 先 `diff <文件>`，确认后 `apply <文件>` | 按期望状态重写实际配置 |

表中命令均以 `chezmoi` 开头。外部修改尚未收回时，不要先 `apply` 或 `update`，以免丢失改动。

::: tip 两种状态不要混淆

`chezmoi status` 比较实际配置和期望配置；`chezmoi git -- status` 查看源仓库是否有未提交的改动。前者干净不代表已经提交，后者干净也不代表实际改动已收回。

:::

### 推送本机修改与接收远端更新

若先改了普通目标文件，先执行 `chezmoi re-add ~/.gitconfig`，然后提交：

```sh title="push.sh"
chezmoi git -- add .
chezmoi git -- diff --cached
chezmoi git -- commit -m "更新个人配置"
chezmoi git -- push
```

接收更新前，先收回实际文件的改动，处理源仓库中未提交的修改，再选择一种方式：

| 方式 | 命令顺序 | 适用场景 |
| :-- | :-- | :-- |
| 先审阅再应用 | `chezmoi git -- pull --rebase` → `chezmoi diff` → `chezmoi apply` | 推荐默认流程，可在应用前检查差异 |
| 快捷更新 | `chezmoi update` | 可信仓库；拉取后**立即应用**，不是仅下载 |

发生 Git 冲突时先解决冲突，再应用。`update` 不会收回或推送本机配置修改。

### 停止管理或删除文件

| 需求 | 操作 | 边界 |
| :-- | :-- | :-- |
| 停止管理，保留实际文件 | `chezmoi forget <文件>` | 从源目录移除，需提交并推送 |
| 删除源文件和实际文件 | `chezmoi destroy <文件>` | 有破坏性，先确认路径 |
| 让其他机器也删除旧文件 | 在源目录的 `.chezmoiremove` 中写目标相对路径 | 提交后，各机应用时删除匹配项，谨慎使用通配符 |

仅从仓库移除文件，**不等于**要求其他机器删除它。

## 四、忽略规则与跨平台配置 {#rules}

### 1. `.chezmoiignore` 与 `.gitignore` {#ignore}

`.chezmoiignore` 放在源目录根部，规则匹配**相对于目标目录的路径**，统一使用 `/`，不写 `dot_`、`private_` 等源文件名属性。例如 `.pi/agent/auth.json` 匹配 `~/.pi/agent/auth.json`。

```text title=".chezmoiignore"
# 仅供源仓库使用，不部署到主目录
README.md
AGENTS.md

# 同时忽略目录本身及内容
.pi/agent/sessions
.pi/agent/sessions/**
```

| 操作 | 忽略规则的效果 |
| :-- | :-- |
| 先写规则，再 `add <目录>` | 递归添加时跳过匹配项，不复制到源目录 |
| 执行 `apply` | 不改写匹配的实际文件 |
| 先添加文件，后写规则 | 停止处理匹配项，但**不删除已有源文件或 Git 历史** |

`.gitignore` 控制 Git 对未跟踪文件的忽略，不代替 chezmoi 的添加或部署规则。两者都不会撤销已有 Git 跟踪。

::: warning 忽略不等于清理

误添加凭据后，不能只补一条忽略规则。还要移除**源目录里的旧副本**，检查暂存区，并在已跟踪时提交删除；不要误删应用正在使用的目标文件。`chezmoi managed` 不显示它，不代表 Git 仓库里没有副本。

:::

仓库根部普通的 `README.md`、`AGENTS.md` 若未忽略，会映射到 `~/README.md`、`~/AGENTS.md`；后者可能被 AI 工具作为上级目录指令读取。新增忽略规则不会删除已部署的旧副本，确认无独立修改后再手动清理。

```sh title="inspect-paths.sh"
# 第一条在源目录根部运行
chezmoi target-path --source-path AGENTS.md README.md
chezmoi ignored
chezmoi managed
```

### 2. 模板变量与本机配置 {#templates}

机器差异通过模板表达，而不是给每台设备维护一份完整副本。先用 `chezmoi edit-config` 在本机配置中合并：

```toml title="chezmoi.toml"
[data]
email = "me@example.com"
```

再把已有 Git 配置转成模板并编辑：

```sh title="template.sh"
chezmoi add --template ~/.gitconfig
chezmoi edit ~/.gitconfig
```

在源文件 `dot_gitconfig.tmpl` 中仅替换需要变化的字段，保留其他配置：

```ini title="dot_gitconfig.tmpl"
[user]
    email = {{ .email | quote }}
```

使用 `chezmoi cat ~/.gitconfig` 检查渲染结果，再 `diff`、`apply`。模板还可读取 `.chezmoi.os`（`windows` / `darwin` / `linux`）、`.chezmoi.hostname`、`.chezmoi.arch`；`chezmoi data` 可查看变量，但输出可能含敏感值。

注意区分两种 chezmoi 配置文件：

| 文件 | 放在哪里 | 用途 |
| :-- | :-- | :-- |
| `chezmoi.toml` | 本机 `~/.config/chezmoi/` | 运行时读取的设置；各机变量和私钥路径通常不同，不直接提交共享仓库 |
| `.chezmoi.toml.tmpl` | 源目录根部 | 初始化模板；`chezmoi init` 用它生成本机配置，可以提交，但不能写死密钥 |

初始化模板可用 `promptStringOnce` 询问邮箱等变量。模板变更后需重新运行 `chezmoi init`；先保留本机独有设置，避免重新生成时丢失。后文 age 示例展示它的具体用法。

### 3. 目标目录、系统判断与共享模板

目标目录默认是主目录：Windows 通常为 `%USERPROFILE%`。`chezmoi add ~/.pi` 只是添加其中的 `.pi`，不会改变目标根目录。命令行 `--destination`（`-D`）或本机配置 `destDir` 可以改变它，但会影响整套配置。

同一应用在不同系统使用不同路径时，可让 `.chezmoiignore` 按系统排除不适用的一份。例如 Windows 使用 `~/Remoting/.toolconfig`，macOS/Linux 使用 `~/.config/.toolconfig`：

```text title=".chezmoiignore"
{{ if eq .chezmoi.os "windows" }}
.config/.toolconfig
{{ else }}
Remoting/.toolconfig
{{ end }}
```

规则只决定哪些路径生效，源目录中仍需各有一份对应源文件。若内容相同，用共享模板避免重复维护：

```text title="shared-template-tree.txt"
.chezmoitemplates/toolconfig
dot_config/dot_toolconfig.tmpl
Remoting/dot_toolconfig.tmpl
```

两个 `.tmpl` 文件均写入以下内容，共用正文放在 `.chezmoitemplates/toolconfig`：

```text title="dot_toolconfig.tmpl"
{{ includeTemplate "toolconfig" . }}
```

若 `.toolconfig` 是目录，则为其中要共享的每个文件建立对应模板；平台间内容也有差异时，在共享模板里按 `.chezmoi.os` 分支处理。

## 五、实战：同步 Pi 个人配置 {#pi-config}

本例只管理 Pi 的**个人级配置**。默认目录是 `~/.pi/agent`；若设置 `PI_CODING_AGENT_DIR`，应改用变量指向的实际目录，并相应调整源文件和忽略规则。以下统一假设各机使用默认目录。

### 1. 选择共享范围

| 目标路径（均位于 `~/.pi/agent/`） | 建议 |
| :-- | :-- |
| `settings.json`、`keybindings.json` | 可同步；先检查资源路径是否能跨机使用 |
| `AGENTS.md` | 可同步；先检查个人指令中是否含隐私 |
| `skills/`、`extensions/` | 按需同步；审核代码、依赖、路径及可能夹带的密钥 |
| `models.json`、`mcp.json` | 可能含密钥，默认排除；审核后选择普通配置或密钥模板 |
| `auth.json` | 默认排除，推荐逐设备 `/login`；确需共享时整文件加密 |
| `sessions/`、`npm/`、缓存及本机状态 | 不作为共享配置纳管；不要同步其他设备的信任决策 |

以 `settings.json` 为例，对应源路径是 `dot_pi/agent/settings.json`；转为模板后是 `dot_pi/agent/settings.json.tmpl`。

### 2. 先写忽略规则，再添加文件

初始化源仓库后，把以下规则合并到源目录的 `.chezmoiignore`：

```text title=".chezmoiignore"
# 默认排除凭据与可能含密钥的配置
.pi/agent/auth.json
.pi/agent/models.json
.pi/agent/mcp.json
.pi/agent/**/.env
.pi/agent/**/.env.*

# 本机状态、安装产物与缓存
.pi/agent/trust.json
.pi/agent/sessions
.pi/agent/sessions/**
.pi/agent/npm
.pi/agent/npm/**
.pi/agent/web-search-cache
.pi/agent/web-search-cache/**
```

**推荐按文件添加**，只对已存在且审核过的文件执行：

```sh title="pi-selected-config.sh"
chezmoi add ~/.pi/agent/settings.json ~/.pi/agent/keybindings.json
chezmoi add ~/.pi/agent/AGENTS.md        # 可选
chezmoi add ~/.pi/agent/skills          # 可选：先审核内容
chezmoi add ~/.pi/agent/extensions      # 可选：先审核代码与依赖
```

如果已逐项确认其他文件也适合共享，可以改用 `chezmoi add ~/.pi/agent` 递归添加。上述规则只是起点，不会识别所有敏感文件，也不会阻止未来出现的新文件被收集。

添加后用 `chezmoi managed ~/.pi/agent`、`chezmoi git -- status --short` 和暂存区差异核对，再按[日常维护](#daily)提交。如果过去已误添加凭据，按[忽略规则](#ignore)中的清理流程处理。

### 3. 按机器生成默认模型设置

如果所有设备配置相同，保留普通 JSON 即可；需要不同默认模型时，执行 `chezmoi add --template ~/.pi/agent/settings.json`，再用 `chezmoi edit-config` 为每台设备填写：

```toml title="chezmoi.toml"
[data.pi]
provider = "anthropic"
model = "替换为此 provider 实际提供的模型 ID"
```

编辑源模板，仅替换相关字段并保留其他设置：

```text title="dot_pi/agent/settings.json.tmpl"
{
  "$schema": "https://pi.dev/schemas/settings.schema.json",
  "defaultProvider": {{ .pi.provider | toJson }},
  "defaultModel": {{ .pi.model | toJson }}
}
```

运行 `chezmoi cat ~/.pi/agent/settings.json` 检查 JSON，然后预览、应用。Pi 中可用 `/reload` 重新加载手动修改的设置和资源；默认模型是启动选择，当前会话如需立即切换，使用 `/model` 或重启。

### 4. 新设备需要额外准备什么

复用[新设备恢复流程](#restore)，但在应用前确认：

1. 已安装 Pi，个人配置目录与示例一致。
2. 使用模板时已填写本机 `data.pi` 等变量；引用的技能、扩展及其依赖可用。
3. 使用加密配置时已准备 age 私钥和本机解密配置，见[加密章节](#encryption)。
4. 未共享 `auth.json` 时，在新设备用 `/login` 认证；同步凭据也不保证会话永不过期。

后续修改遵循[日常维护](#daily)：普通文件用 `re-add` 收回，模板直接编辑或用 `merge` 合并。不要把 `update` 当作“仅拉取、稍后再应用”的命令。

## 六、敏感配置与 age 加密 {#encryption}

### 1. 先选择存储方式

| 方式 | 适合内容 | 边界 |
| :-- | :-- | :-- |
| 不共享，逐设备认证 | Pi `auth.json` 等登录状态 | 推荐默认做法，无需跨设备分发解密密钥 |
| age / GPG 整文件加密 | 必须完整保存的敏感配置 | Git 存密文，应用时解密为目标文件 |
| 加密 JSON + 应用模板 | 多个应用复用的 API Key | 密钥集中维护，模板生成包含真实值的配置 |
| 1Password / Bitwarden 等集成 | Token、密码、少量字段 | 仓库存引用，通常需对应 CLI、登录和解锁 |

下文统一使用 age 私钥路径 `~/.config/chezmoi/age.txt`。**整文件加密**与**密文作为模板数据源**是两种不同用法，不必同时采用。

::: warning 加密保护的是仓库副本

应用后的配置仍可能是明文。`diff`、`cat`、详细预览、模板变量和合并界面可能显示密钥，不要贴入聊天、截图或 CI 日志。私钥必须与 Git 仓库分开保管，并单独安全备份；私钥泄露后应轮换相关 API Key，仅更换 age 私钥不能保护已经泄露的历史密文。

:::

### 2. 统一准备 age 密钥和配置 {#age-setup}

**已有私钥可继续使用，不要覆盖或为新增 API Key 反复生成。** 普通 age 密钥可使用 chezmoi 的内置支持，无需另装 age。

macOS / Linux 首次生成：

```sh title="create-age-key.sh"
mkdir -p ~/.config/chezmoi
chmod 700 ~/.config/chezmoi
chezmoi age-keygen --output ~/.config/chezmoi/age.txt
chmod 600 ~/.config/chezmoi/age.txt
chezmoi age-keygen -y ~/.config/chezmoi/age.txt
```

Windows PowerShell：

```powershell title="create-age-key.ps1"
$keyDir = Join-Path $HOME ".config/chezmoi"
New-Item -ItemType Directory -Force -Path $keyDir | Out-Null
chezmoi age-keygen --output (Join-Path $keyDir "age.txt")
chezmoi age-keygen -y (Join-Path $keyDir "age.txt")
```

`age.txt` 包含**私钥**；最后一条命令输出 `age1...` 开头的**公钥**。Windows 需用账户权限和 NTFS ACL 限制私钥访问，不能套用 Unix 的 `chmod`。

本机配置有两种设置方式，按需选一种。

**方式 A：手动维护本机配置。** 用 `chezmoi edit-config` 合并以下内容：

```toml title="chezmoi.toml"
# 顶层字段必须放在 [data]、[age] 等表之前
encryption = "age"

[age]
identity = "/Users/YOUR_NAME/.config/chezmoi/age.txt"
recipient = "age1替换为实际公钥"
```

将 `identity` 改为私钥绝对路径。Windows 可使用 TOML 单引号字符串 `'C:\Users\YOUR_NAME\.config\chezmoi\age.txt'`，其中反斜杠不需要双写。私钥与本机配置均不提交 Git。

**方式 B：用初始化模板生成配置。** 在源目录创建或合并 `.chezmoi.toml.tmpl`，公钥替换为真实值：

```toml title=".chezmoi.toml.tmpl"
encryption = "age"

[age]
identity = {{ joinPath .chezmoi.homeDir ".config" "chezmoi" "age.txt" | toJson }}
recipient = "age1替换为实际公钥"
```

它只包含公钥和路径，可以提交。`joinPath` 按当前系统拼接路径，`toJson` 输出带引号和转义的字符串，避免 Windows 路径破坏 TOML。先保留本机独有的 `[data]` 等设置，再运行 `chezmoi init` 生成本机配置；需要长期保留的配置逻辑应合入初始化模板。

::: details 可选：用 Neovim 编辑密文并减少明文残留

确认各设备可运行 `nvim --version`，再将以下表合并到本机配置，或合并到初始化模板后重新 `init`：

```toml title="chezmoi.toml"
[edit]
command = "nvim"
args = [
  "-n",
  "-i", "NONE",
  "-c", "set noundofile nobackup nowritebackup",
]
```

`-n` 禁用 swap，`-i NONE` 禁用 ShaDa 读写，`-c` 关闭持久化 undo、备份和写入备份。TOML 数组末尾的逗号合法。这些参数影响该配置启动的所有编辑会话，但不能阻止插件自行保存或上传内容。

终端版 nvim 保持前台运行，无需 VS Code 的 `--wait` 参数。编辑密钥后用 `:wq` 保存并退出，chezmoi 才会重新加密；仅 `:w` 不会结束编辑流程。合并工具由 `[merge]` 单独配置，不受 `[edit]` 控制。

:::

### 3. 实战 A：整文件加密 Pi `auth.json` {#encrypted-auth}

默认仍建议逐设备 `/login`。确实需要共享认证文件时，先完成 [age 配置](#age-setup)，再从 `.chezmoiignore` 移除 `.pi/agent/auth.json`；否则加密添加也会被忽略。

```sh title="pi-auth.sh"
chezmoi add --encrypt ~/.pi/agent/auth.json
```

源目录生成 `dot_pi/agent/encrypted_auth.json.age`（如同时带有权限属性，文件名还可能包含 `private_`）。确认保存的是密文、没有旧明文副本，再检查并提交。应用时 chezmoi 将其解密到 `~/.pi/agent/auth.json`。

新设备的私钥与配置准备见[加密配置的恢复与维护](#secret-maintenance)，Git 恢复命令无需另写一套。认证状态可能刷新或失效，不建议把多设备频繁变动的登录状态当作稳定配置持续覆盖。

### 4. 实战 B：用一个密文集中管理 API Key {#api-keys}

适用于多个应用配置需要不同 API Key 的场景。前提是应用对应字段支持直接填写密钥；此方案**不是自动设置 shell 环境变量**。

```text title="secret-flow.txt"
Git：secrets.json.age + 各应用 .tmpl
                  ↓ 本机 age 私钥解密、模板渲染
目标：包含真实 API Key 的 JSON / YAML 配置
```

这里的 `secrets.json.age` 是模板数据源，不部署它本身；与带 `encrypted_` 属性的整文件加密目标不同。

#### 第一步：创建 JSON 并加密

完成 [age 配置](#age-setup)后，在**仓库外**创建 `~/.config/chezmoi/secrets.json`。创建时限制访问权限，不要把真实密钥写入命令行历史：

```json title="secrets.json"
{
  "WAW_GPT_API_KEY": "替换为实际密钥",
  "KAGI_API_KEY": "替换为实际密钥",
  "4ROUTER_API_KEY": "替换为实际密钥"
}
```

Bash / Zsh：

```sh title="encrypt-secrets.sh"
chezmoi encrypt ~/.config/chezmoi/secrets.json --output "$(chezmoi source-path)/secrets.json.age"
```

PowerShell：

```powershell title="encrypt-secrets.ps1"
chezmoi encrypt (Join-Path $HOME ".config/chezmoi/secrets.json") --output (Join-Path (chezmoi source-path) "secrets.json.age")
```

只提交密文。验证解密和应用无误后删除明文草稿，以后直接编辑密文；普通删除不保证彻底擦除 SSD、备份或同步服务中的历史副本。

#### 第二步：忽略数据源，但让 Git 保存它

在源目录 `.chezmoiignore` 中增加：

```text title=".chezmoiignore"
# 仅供模板读取，不部署到主目录
secrets.json.age
```

单独的 `.age` 后缀不会触发自动解密；没有 `encrypted_` 属性时，它本来会映射为 `~/secrets.json.age`，所以规则恰好与源文件名相同。规则仍按目标相对路径匹配，目标文件不必已存在。

忽略不会阻止模板从源目录读取密文。**不要把它加入 `.gitignore`**，否则新设备无法取得密钥数据源。仓库说明文件的排除见[忽略规则](#ignore)。

#### 第三步：将应用配置转换为私有模板

对已有源文件改名，只替换密钥字段，保留其他配置。不要同时留下映射到同一目标的旧文件和新模板。

| 源目录模板路径 | 生成的目标路径 |
| :-- | :-- |
| `dot_pi/agent/private_models.json.tmpl` | `~/.pi/agent/models.json` |
| `dot_pi/agent/private_mcp.json.tmpl` | `~/.pi/agent/mcp.json` |
| `private_dot_config/opencode/private_opencode.json.tmpl` | `~/.config/opencode/opencode.json` |
| `private_dot_omp/private_agent/private_models.yml.tmpl` | `~/.omp/agent/models.yml` |

`private_` 在 Unix 上移除组和其他用户权限，普通配置通常变成 `0600`；父目录带有 `private_` 不等于文件本身就是 `0600`，文件也应单独声明。Windows 访问保护需结合 ACL。改名只改变期望状态，需 `apply` 才更新目标权限。

如果仍忽略 `.pi/agent/models.json`、`.pi/agent/mcp.json`，此时移除对应规则，否则模板不会部署。

每个应用模板开头读取密文，随后引用键名。以下只是 JSON 字段的最小示例，**不是完整的应用配置**：

```text title="private_example.json.tmpl"
{{- $secrets := joinPath .chezmoi.sourceDir "secrets.json.age" | include | decrypt | fromJson -}}
{
  "apiKey": {{ index $secrets "WAW_GPT_API_KEY" | toJson }}
}
```

不要在 `{{ index ... | toJson }}` 外再套双引号；`toJson` 已负责字符串引号和转义。键名错误可能得到 `null`，应用前需检查键是否存在、值是否为非空字符串。

::: details 模板表达式逐项说明

| 表达式 | 作用 |
| :-- | :-- |
| `{{ ... }}` | Go template 动作，由 chezmoi 执行，不是 shell 命令 |
| `{{-` / `-}}` | 去掉动作前后相邻空白，避免声明行为 JSON 留下多余空行 |
| `$secrets := ...` | 定义当前模板的局部变量，不是跨模板全局变量 |
| `.chezmoi.sourceDir` | 源目录绝对路径，不是目标主目录 |
| `joinPath` | 拼接密文路径 |
| `\|` | 将前一步结果作为下一函数的最后一个参数 |
| `include` | 读取原始内容，不把被读文件再次作为模板执行 |
| `decrypt` | 使用本机配置的加密方式和私钥解密 |
| `fromJson` | 将 JSON 明文解析为对象 |
| `index $secrets "键名"` | 按字符串键名取值，兼容数字开头的键 |
| `toJson` | 编码为 JSON，处理引号与特殊字符转义 |

:::

原来的 `"apiKey": "$WAW_GPT_API_KEY"` 或 `"apiKey": "{env:WAW_GPT_API_KEY}"`，可替换为上述表达式。MCP 启动器也可把生成的值传入子进程环境；在已声明 `$secrets` 的模板中使用如下片段：

```text title="mcp-env.json.tmpl"
"env": {
  "KAGI_API_KEY": {{ index $secrets "KAGI_API_KEY" | toJson }}
}
```

这不要求用户事先在 shell 中导出变量。YAML 字符串也可复用 `toJson`，因为 JSON 双引号字符串是合法的 YAML 字符串：

```text title="private_models.yml.tmpl"
{{- $secrets := joinPath .chezmoi.sourceDir "secrets.json.age" | include | decrypt | fromJson -}}
providers:
  example:
    apiKey: {{ index $secrets "4ROUTER_API_KEY" | toJson }}
```

模板直接读取源目录密文，不依赖先部署某个明文密钥文件，因此没有目标文件应用顺序问题。完成后在受控终端检查渲染结果及应用格式，预览、应用，再提交旧文件删除、新模板、密文和忽略规则。

### 5. 加密配置的恢复与维护 {#secret-maintenance}

#### 新设备恢复

通过加密介质或可信密码管理器等安全渠道，**单独**将已有私钥放入新设备的 `~/.config/chezmoi/age.txt`。不要通过 Git、普通聊天或未加密网盘传输。

- 手动配置模式：先设置本机 `identity` 和对应 `recipient`，再按[标准恢复流程](#restore)操作。
- 初始化模板模式：私钥就位后执行标准恢复流程，`init` 生成本机配置；若模板配置了编辑器，也需安装它。
- 两种方式都要补齐本机变量。Git 只传送密文和模板，新设备另行生成的新私钥不能解开旧公钥加密的文件。

#### 新增或轮换 API Key

编辑集中密文使用 **`edit-encrypted`**，不是 `edit-encryted`：

```sh title="edit-secrets.sh"
# Bash / Zsh
chezmoi edit-encrypted "$(chezmoi source-path)/secrets.json.age"
```

```powershell title="edit-secrets.ps1"
chezmoi edit-encrypted (Join-Path (chezmoi source-path) "secrets.json.age")
```

::: details 已在源目录，或使用 Windows CMD 时

在源目录根部，各 Shell 都可直接执行：

```sh title="edit-secrets-from-source.sh"
chezmoi edit-encrypted secrets.json.age
```

Windows CMD 不支持 `$()`；也可先运行 `chezmoi source-path`，再把完整密文路径传给 `edit-encrypted`。

:::

编辑器打开的是解密后的临时 JSON。保留原有键，新增键时注意逗号及 JSON 不允许尾随逗号；保存退出后自动重新加密。

新增键后，在应用模板引用 `{{ index $secrets "NEW_SERVICE_API_KEY" | toJson }}`，检查并应用，再提交密文和模板。只轮换已有键的值通常无需改模板，也不需要重新生成私钥或执行 `init`。

#### 应用修改配置后的反向同步

**密文 JSON 维护密钥，源模板维护配置结构。** 平时优先 `chezmoi edit <目标文件>`；应用已修改模型列表、价格等非敏感内容时，可用：

```sh title="merge-template.sh"
chezmoi merge ~/.pi/agent/models.json
# 合并工具中确认并保存 Source，再预览、应用
chezmoi diff ~/.pi/agent/models.json
chezmoi apply ~/.pi/agent/models.json
```

| 合并内容 | 含义 |
| :-- | :-- |
| Destination | 实际配置，包含应用或手工修改 |
| Source | 仓库中的源模板，合理改动应合入这里 |
| Target | 当前源模板渲染出的期望配置 |

默认合并工具是 `vimdiff`，可用 `merge.command`、`merge.args` 单独设置。只合并需要的结构变化，保留 `$secrets` 声明和密钥表达式；**不能用含真实密钥的 Destination 整体覆盖 Source**。

`re-add` 跳过模板；直接 `add` 已管理的目标可能把明文带回源目录，`--template` 也不能保证恢复自定义解密表达式。如果改的是 API Key，更新密文而不是仅改应用文件，否则下次应用会恢复旧值。

::: details 多设备各用独立 age 私钥

每台设备生成自己的密钥，在各机 `[age]` 下配置本机 `identity`，并以 `recipients` 数组替换单个 `recipient`，列出所有设备的公钥。每台设备只保管自己的私钥；`identities` 仅用于本机确实持有多个私钥的情况。

新增收件人后，必须重新加密已有密文；只更新配置不会让旧密文自动支持新私钥：

- **chezmoi 纳管的整文件密文**：确认旧设备的目标内容正确，再执行 `chezmoi re-add --re-encrypt ~/.pi/agent/auth.json`，提交更新的密文。
- **普通数据源 `secrets.json.age`**：在仍能解密的旧设备上，通过受控临时文件解密、按新的收件人集合重新加密，再验证新设备可解密；临时明文不放入仓库，并及时清理。

所有会执行加密的设备都需更新收件人集合，避免后续编辑又丢掉某台设备的公钥。保留至少一个可安全使用的解密私钥；移除收件人只影响重新加密后的副本，不撤销其对旧密文的访问能力。

:::

## 七、自动化与其他进阶能力 {#advanced}

### 自动执行脚本

在源目录创建下列命名的脚本，应用时按规则执行：

| 命名 | 执行时机 |
| :-- | :-- |
| `run_setup.sh` | 每次应用都执行 |
| `run_once_setup.sh` | 本机按内容哈希记录；同一份成功执行过的内容不再执行，内容变化可再次执行 |
| `run_onchange_setup.sh` | 相比上次成功执行，内容变化才执行 |
| `run_once_before_setup.sh` | 在文件更新前，按 `once` 规则执行 |
| `run_onchange_after_reload.sh` | 在文件更新后，按 `onchange` 规则执行 |

脚本可加 `.tmpl` 后缀按系统生成；Windows 可用 `.ps1`。Shell 脚本需正确 shebang（如 `#!/bin/sh`）和解释器。执行记录在本机，新设备会重新执行；脚本应可重复运行且不产生额外破坏，`--dry-run` 不执行脚本。

软件安装、配置重载可放进脚本，但不会自动获得包管理器或系统管理权限。

### 其他能力

| 能力 | 入口 | 边界 |
| :-- | :-- | :-- |
| 共享模板与数据 | `.chezmoitemplates/`、`.chezmoidata.toml` 等 | 避免重复维护；仓库数据会被 Git 保存 |
| 拉取外部配置或插件 | `.chezmoiexternal.toml`，支持文件、压缩包、Git 仓库 | 建议固定版本；`refreshPeriod` 控制刷新，`chezmoi -R apply` 强制刷新；不适合大型资源 |
| 自动提交与推送 | 本机配置 `[git]` 的 `autoCommit`、`autoPush` | 默认关闭，不会监听所有应用修改；误收集内容可能被直接推送 |
| 精确管理目录 | 源目录中的 `exact_` 属性 | 会删除目标目录中未声明且未忽略的条目，不用于混有缓存或运行数据的目录 |

## 八、常见问题与排错 {#troubleshooting}

先区分三层：**模板能否解密并渲染 → 结果是否为合法 JSON/YAML → 应用能否识别并认证**。前两层通过，不等于最后一层也通过。

| 现象 | 原因与处理 |
| :-- | :-- |
| `config file template has changed, run chezmoi init to regenerate config file` | 初始化模板变了；先保留本机独有设置，再 `chezmoi init`。这是 warning，不等于命令失败；不加 `--apply` 不会同时应用全部目标配置 |
| `apply --dry-run` 没有输出 | 不写入不等于显示预览；用 `status` 看状态、`diff` 看差异，或加 `--verbose` |
| 本机能解密，新设备初始化失败 | 检查初始化模板及私钥路径；例如 `recipient = age1...` 缺少引号会生成非法 TOML |
| 新设备无法渲染 Pi 设置 | 确认本机配置含模板所需的 `data.pi` 等变量 |
| 模板渲染成功，应用打不开配置 | chezmoi 不校验应用格式；检查 JSON/YAML 语法和应用字段定义 |
| 密钥字段变成 `null` 或认证失败 | 检查密钥 JSON 中的键名、值类型和非空值，再确认远端凭据有效 |
| `managed` 不显示文件，Git 里仍有它 | 忽略规则不清理旧源文件和 Git 历史，见[忽略规则](#ignore) |
| 改了源文件名或 `private_`，目标没变化 | 检查是否被忽略，是否已执行 `apply`；Windows 还需检查 ACL |
| Git 只显示旧配置删除、新模板未跟踪 | 提交应同时包含旧文件删除、新模板、密文和相关规则，不漏掉未跟踪文件 |
| 修改实际文件后，下次同步又恢复旧值 | 改动未收回；普通文件用 `re-add`，模板用 `merge`，密钥更新密文数据源 |

`chezmoi verify` 检查目标是否符合期望状态，`chezmoi doctor` 诊断运行环境；两者都不能代替应用校验或解决 Git 冲突。

## 九、分类命令速查 {#commands}

`<文件>` 通常指目标路径，例如 `~/.gitconfig`；`<密文路径>` 指实际密文文件。尖括号内容均为占位符，执行时替换，不保留括号。

| 分类 | 命令 | 用途 |
| :-- | :-- | :-- |
| 初始化 | `chezmoi init [仓库地址]` | 初始化源目录、克隆仓库或重新生成本机配置 |
| 初始化 | `chezmoi source-path` | 查看源目录位置 |
| 初始化 | `chezmoi edit-config` | 编辑本机配置 |
| 纳管 | `chezmoi add <文件或目录>` | 收集配置，递归处理目录并跳过忽略项 |
| 纳管 | `chezmoi add --template <文件>` | 转为模板管理 |
| 纳管 | `chezmoi add --encrypt <文件>` | 加密后纳管，需先配置加密 |
| 编辑 | `chezmoi edit <文件>` | 编辑源文件 |
| 编辑 | `chezmoi edit --apply <文件>` | 编辑结束后自动应用 |
| 编辑 | `chezmoi re-add <文件>` | 收回实际文件的修改，跳过模板 |
| 编辑 | `chezmoi merge <文件>` | 用合并工具收回修改，需保留模板表达式 |
| 加密 | `chezmoi encrypt <明文文件> --output <密文路径>` | 生成普通密文数据源 |
| 加密 | `chezmoi edit-encrypted <密文路径>` | 解密到临时目录，编辑退出后重新加密 |
| 加密 | `chezmoi age-keygen -y <私钥路径>` | 从已有私钥导出公钥 |
| 加密 | `chezmoi re-add --re-encrypt <文件>` | 重新加密纳管的整文件密文，不用于普通密文数据源 |
| 检查 | `chezmoi status` / `chezmoi diff` | 查看部署状态 / 具体差异 |
| 检查 | `chezmoi cat <文件>` | 查看将生成的内容，可能包含明文密钥 |
| 检查 | `chezmoi managed` / `chezmoi ignored` | 列出纳管 / 被忽略的路径 |
| 检查 | `chezmoi verify` / `chezmoi doctor` | 验证目标状态 / 诊断环境 |
| 应用 | `chezmoi apply --dry-run --verbose` | 预演，不实际写入目标或执行脚本 |
| 应用 | `chezmoi apply [文件]` | 应用全部或指定配置 |
| 同步 | `chezmoi git -- status` | 查看源仓库的 Git 状态 |
| 同步 | `chezmoi git -- <Git 参数>` | 在源仓库执行 add、commit、pull、push 等 |
| 同步 | `chezmoi update` | 拉取远端更新并立即应用 |
| 模板 | `chezmoi data` | 查看模板变量，可能含敏感数据 |
| 外部资源 | `chezmoi -R apply` | 强制刷新外部资源并应用 |
| 移除 | `chezmoi forget <文件>` | 停止管理，保留实际文件 |
| 移除 | `chezmoi destroy <文件>` | 删除源文件和实际文件 |
| 帮助 | `chezmoi <命令> --help` | 查询参数及行为 |

## 参考

- [官方快速开始](https://www.chezmoi.io/quick-start/)
- [日常操作](https://www.chezmoi.io/user-guide/daily-operations/)
- [Pi 配置文件说明](https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/docs/configuration.md)
- [Pi 凭据与认证方式](https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/docs/providers.md)
- [机器差异与模板](https://www.chezmoi.io/user-guide/manage-machine-to-machine-differences/)
- [.chezmoiignore 规则](https://www.chezmoi.io/reference/special-files/chezmoiignore/)
- [age 加密](https://www.chezmoi.io/user-guide/encryption/age/)
- [decrypt 模板函数](https://www.chezmoi.io/reference/templates/functions/decrypt/)
- [编辑加密文件](https://www.chezmoi.io/reference/commands/edit-encrypted/)
- [初始化配置模板](https://www.chezmoi.io/reference/special-files/chezmoi-format-tmpl/)
- [脚本执行规则](https://www.chezmoi.io/user-guide/use-scripts-to-perform-actions/)
- [外部文件与插件](https://www.chezmoi.io/user-guide/include-files-from-elsewhere/)
