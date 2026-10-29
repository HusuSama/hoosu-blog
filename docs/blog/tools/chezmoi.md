---
title: chezmoi 使用指南：跨机器配置管理与命令速查
createTime: 2026/10/29 11:28:19
tags:
  - chezmoi
  - 配置管理
  - 环境配置
permalink: /blog/uxvjmk0r/
---

## 先判断是否适合

[chezmoi](https://www.chezmoi.io/) 用来管理个人配置文件（dotfiles）：把配置保存到 Git 仓库，在不同机器上按模板生成所需文件，支持 Windows、macOS 和 Linux。

| 方案 | 同步方式 | 多机器差异 | 适合场景与边界 |
| :-- | :-- | :-- | :-- |
| **chezmoi** | Git 保存被管理的配置，执行命令生成并应用 | 内置模板、系统判断、密钥集成 | 跨平台个人配置；默认不实时同步，不自动收集应用产生的修改 |
| Git + 手动复制 | 自己维护复制脚本或直接跟踪文件 | 自己写脚本或分支 | 配置少、需求简单；路径、权限、部署都要自行处理 |
| GNU Stow | 将仓库中的文件软链接到目标位置，Git 负责跨机传输 | 主要靠拆分目录或额外脚本 | Unix 环境、配置大体一致；自身不提供模板或远端同步 |
| yadm | 用 Git 管理主目录下的配置 | 支持替代文件、模板、加密 | 喜欢直接编辑实际文件的 Git 工作流；Windows 通常通过 WSL 使用 |
| Syncthing / OneDrive 等 | 持续同步文件内容 | 通常同步相同内容，靠排除规则区分 | 普通资料共享；不负责按系统生成配置，锁文件和并发修改需额外处理 |
| Ansible | 按清单和任务部署配置、软件及服务 | 变量、模板、角色 | 多主机运维；个人 dotfiles 也能用，但环境与任务维护成本更高 |

**使用边界**：优先纳管文本配置，不要直接纳管整个主目录、缓存、数据库或频繁变化的应用状态。chezmoi 不是完整备份工具；安装软件需要调用 Scoop、Homebrew 等包管理器。

## 一、安装

Windows 使用 **Scoop**（包管理器名称是 `scoop`）：

```powershell title="install.ps1"
# 已安装 Scoop；未安装时先参考下方的 Scoop 指南
scoop install git chezmoi
chezmoi --version
```

Scoop 的安装和目录设置见 [Scoop 使用指南](/blog/scoop-guide/)。

macOS 使用 Homebrew；Linux 示例适用于已安装 Homebrew 的环境，其他发行版见[官方安装方式](https://www.chezmoi.io/install/)：

```sh title="install.sh"
brew install git chezmoi
chezmoi --version
```

下文基本流程命令可在 PowerShell、Bash、Zsh 中执行。`~` 表示用户主目录；示例路径需换成实际存在的配置文件。命令行为按 chezmoi **v2.73.3** 核对。

## 二、初始化并纳管文件

### 1. 创建本地仓库

```sh title="init.sh"
chezmoi init
chezmoi source-path
```

chezmoi 管理目录默认是 `~/.local/share/chezmoi`；运行 `chezmoi source-path` 可查看它的实际位置。

| 位置 | 内容 | 如何修改 |
| :-- | :-- | :-- |
| chezmoi 管理目录 | Git 跟踪的配置文件、模板和脚本 | `chezmoi edit` 或编辑这个目录中的文件 |
| 实际配置目录（默认主目录） | 应用读取的文件，例如 Pi 的 `~/.pi/agent/settings.json` | 运行 `chezmoi apply`；直接改完后可用 `chezmoi re-add` 收回修改 |
| 本机配置 | chezmoi 的编辑器、模板变量、加密设置等 | `chezmoi edit-config`；默认不随 dotfiles 仓库同步 |

### 2. 添加现有配置

先从一个不含密钥的文件开始，例如已存在的 `~/.gitconfig`：

```sh title="add.sh"
chezmoi add ~/.gitconfig
chezmoi managed
```

其他路径示例（按需选择）：

| 系统 | 示例命令 |
| :-- | :-- |
| Windows PowerShell 配置 | `chezmoi add "$PROFILE"`，文件需先存在 |
| Windows 用户目录下的应用配置 | `chezmoi add "$env:APPDATA/MyApp/settings.json"` |
| macOS / Linux 的 Zsh 配置 | `chezmoi add ~/.zshrc` |
| 编辑器配置目录 | `chezmoi add ~/.config/nvim` 会递归添加；先检查目录内容，只纳管需要共享的配置文件 |

chezmoi 默认把配置复制到管理目录，不会把实际配置替换为软链接。管理文件名带有属性，例如 `dot_gitconfig` 对应 `~/.gitconfig`；日常命令通常传**实际配置路径**即可。

### 3. 修改、预览、应用

```sh title="edit-apply.sh"
chezmoi edit ~/.gitconfig
chezmoi diff
chezmoi apply --dry-run --verbose
chezmoi apply --verbose
```

`edit` 修改 chezmoi 管理目录中的文件；`diff` 查看将发生的变化；`apply` 才写入实际配置。只处理一个文件时，可用 `chezmoi diff ~/.gitconfig` 和 `chezmoi apply ~/.gitconfig`。

## 三、保存到远端仓库

先在 GitHub、GitLab 等平台创建一个**空仓库**，建议命名为 `dotfiles`。将 `YOUR_NAME` 换成账号名：

```sh title="publish.sh"
chezmoi git -- status
chezmoi git -- add .
chezmoi git -- diff --cached
chezmoi git -- commit -m "初始化个人配置"
chezmoi git -- branch -M main
chezmoi git -- remote add origin https://github.com/YOUR_NAME/dotfiles.git
chezmoi git -- push -u origin main
```

`chezmoi git -- ...` 在 chezmoi 管理目录中的 Git 仓库执行命令，无需切换目录。首次提交需已配置 Git 用户名和邮箱；推送使用 Git 平台支持的凭据或 SSH 认证。

::: warning 私有仓库也不要直接存明文密钥
提交前检查暂存区。`private_` 前缀只限制目标文件权限，**不加密内容**；密钥处理见进阶章节。已提交过的密钥即使删除文件，仍可能留在 Git 历史中。

:::

## 四、在新机器恢复

安装 Git 和 chezmoi，并准备仓库访问凭据，再执行：

```sh title="restore.sh"
chezmoi init https://github.com/YOUR_NAME/dotfiles.git
chezmoi diff
chezmoi apply --dry-run --verbose
chezmoi apply --verbose
```

私有仓库也可用 SSH 地址：`git@github.com:YOUR_NAME/dotfiles.git`。需要解密或调用密码管理器时，先准备对应密钥、CLI 和登录状态。

对已审阅、可信的个人仓库，可将初始化与应用合并为 `chezmoi init --apply <仓库地址>`。仓库里的 `run_` 脚本会随应用执行，首次恢复应先检查脚本和差异。

## 五、日常修改与同步

### 先选对修改方向

| 你做了什么 | 下一步 | 注意 |
| :-- | :-- | :-- |
| 想主动修改配置 | `chezmoi edit <文件>` → `diff` → `apply` | 修改 chezmoi 管理目录中的文件，再部署 |
| Pi 或自己改了实际文件 | `chezmoi re-add <文件>` | 收回修改到 chezmoi 管理目录；**跳过模板文件**，不会反推模板 |
| 需要把实际文件的改动合入模板 | `chezmoi merge <文件>` | 调用合并工具，将修改合入管理目录中的文件后审阅 |
| 想放弃实际文件的本地改动 | 先 `diff <文件>`，确认后 `apply <文件>` | 按 chezmoi 管理目录中的期望状态重写实际配置 |

::: tip 两种“状态”不要混淆
`chezmoi status` 比较“实际配置”和“chezmoi 管理目录生成的期望配置”；`chezmoi git -- status` 查看 Git 仓库是否有未提交的改动。两边都检查，才能知道 Pi 配置修改是否已收集、提交。

:::

### 把本机修改发送到远端

如果先改了实际配置，先运行 `chezmoi re-add ~/.gitconfig`；然后提交 chezmoi 管理目录中的文件：

```sh title="push.sh"
chezmoi git -- add .
chezmoi git -- diff --cached
chezmoi git -- commit -m "更新个人配置"
chezmoi git -- push
```

### 在其他机器拉取更新

先处理实际配置和 chezmoi 管理目录中的未提交修改，再拉取、预览、应用：

```sh title="pull.sh"
chezmoi git -- pull --autostash --rebase
chezmoi diff
chezmoi apply
```

日常确认仓库可信后，也可用 `chezmoi update` 一步完成拉取与应用；它不会把本机修改推送到远端。

### 停止管理或删除文件

| 需求 | 操作 | 边界 |
| :-- | :-- | :-- |
| 停止管理，保留本机文件 | `chezmoi forget <文件>` | 从 chezmoi 管理目录移除；提交并推送后才影响仓库 |
| 删除 chezmoi 管理目录中的文件和本机实际文件 | `chezmoi destroy <文件>` | 有破坏性，执行前确认路径 |
| 让所有机器删除某个旧文件 | 在 chezmoi 管理目录的 `.chezmoiremove` 中写入实际相对路径，再应用 | 提交后其他机器应用时也会删除匹配项，谨慎使用通配符 |

仅从仓库移除一个文件，**不等于**要求其他机器删除它。

## 六、Pi 配置示例

本例把 Pi 的**个人级配置**放进 Git，由 chezmoi 生成回 `~/.pi/agent`。Pi 的默认目录是 `~/.pi/agent`；若设置了环境变量 `PI_CODING_AGENT_DIR`，Pi 实际读取的目录会改为该变量指向的位置。为让这份示例在新机器上直接生效，建议所有机器使用默认目录。

### 路径对应关系

| Pi 实际读取或写入的路径 | chezmoi 管理目录中的对应文件 | 处理建议 |
| :-- | :-- | :-- |
| `~/.pi/agent/settings.json` | `dot_pi/agent/settings.json` | 可同步；保存 Pi 的默认设置 |
| `~/.pi/agent/keybindings.json` | `dot_pi/agent/keybindings.json` | 可同步；保存快捷键设置 |
| `~/.pi/agent/AGENTS.md` | `dot_pi/agent/AGENTS.md` | 可同步；保存个人指令，先检查是否含隐私 |
| `~/.pi/agent/skills/` | `dot_pi/agent/skills/` | 可选同步个人技能；先移除不需要的文件 |
| `~/.pi/agent/extensions/` | `dot_pi/agent/extensions/` | 可选同步个人扩展；确认代码可信且不含密钥 |
| `~/.pi/agent/auth.json` | 加密后是 `dot_pi/agent/encrypted_auth.json.age` | 不要明文提交；建议逐设备登录，或按下文用 age 加密 |
| `~/.pi/agent/sessions/` | 不纳管 | 包含对话历史，不是配置备份 |

chezmoi 管理目录默认是 `~/.local/share/chezmoi`。例如，Pi 读取的 `~/.pi/agent/settings.json`，在 chezmoi 管理目录中的位置是 `~/.local/share/chezmoi/dot_pi/agent/settings.json`；`.pi` 目录前的 `dot_` 是 chezmoi 的文件命名方式。age 加密 Pi 的 `~/.pi/agent/auth.json` 后，文件在管理目录中是 `~/.local/share/chezmoi/dot_pi/agent/encrypted_auth.json.age`：`encrypted_` 和 `.age` 标记了密文，`dot_pi` 仍对应实际目录 `.pi`。如果 Pi 使用 `PI_CODING_AGENT_DIR` 自定义目录，`chezmoi add` 必须指向那个目录中的实际 Pi 文件。

### 1. 同步安全的 Pi 配置

先运行 `chezmoi init`，在 chezmoi 管理目录中新建或编辑 `~/.local/share/chezmoi/.chezmoiignore`，**保存规则后再添加 Pi 文件**：

```text title="~/.local/share/chezmoi/.chezmoiignore"
# 默认不共享凭据或可能含密钥的配置；需要共享时另行检查或加密
.pi/agent/auth.json
.pi/agent/models.json
.pi/agent/mcp.json
.pi/agent/**/.env
.pi/agent/**/.env.*

# 同时忽略目录本身及其内容
.pi/agent/sessions
.pi/agent/sessions/**
.pi/agent/npm
.pi/agent/npm/**
.pi/agent/web-search-cache
.pi/agent/web-search-cache/**
```

规则写的是相对于主目录的 **Pi 实际路径**，例如 `.pi/agent/auth.json`，不是 `dot_pi/agent/auth.json`。这些规则是起点，不会自动识别所有密钥；请按实际文件补充。

**方式一：先过滤，再添加整个 Pi 目录。**确认未被忽略的文件都适合共享后执行：

```sh title="pi-config.sh"
chezmoi add ~/.pi/agent
chezmoi managed ~/.pi/agent
chezmoi git -- status --short
```

`add` 会递归添加，但**匹配 `.chezmoiignore` 的文件会被跳过，不会复制到 chezmoi 管理目录**；通常会提示 `ignoring .pi/agent/auth.json`。后续 `apply` 也不会改写被忽略的 Pi 文件。

**方式二：只添加指定文件。**如果不确定目录里还包含哪些信息，也可以不用整目录添加，改为按需执行：

```sh title="pi-selected-config.sh"
chezmoi add ~/.pi/agent/settings.json ~/.pi/agent/keybindings.json
chezmoi add ~/.pi/agent/AGENTS.md        # 可选：文件存在且内容适合跨设备共享时
chezmoi add ~/.pi/agent/skills          # 可选：先审核技能文件
chezmoi add ~/.pi/agent/extensions      # 可选：先审核扩展代码
```

两种方式都遵守忽略规则；只对已有文件执行 `add` 即可。设置中的 `extensions` / `skills` 路径还需确认能否跨机使用。`models.json`、`mcp.json` 默认在本例中被忽略；需要共享时，先检查是否含密钥，再移除对应规则，选择普通添加或加密添加。选好文件后，按前文流程检查、提交并推送。

::: warning 后加忽略规则不会清理已有副本

如果先 `add` 过 `auth.json`，后来才写忽略规则，chezmoi 会停止处理它，**但管理目录中的旧副本仍然存在**，仍可能被 Git 提交。需另外移除 chezmoi 管理目录中的凭据副本（不是 Pi 正在使用的 `~/.pi/agent/auth.json`），检查 Git 暂存区，并在已跟踪时提交删除。`chezmoi managed` 不显示它，不代表仓库里没有旧副本；忽略规则也不会清除 Git 历史。凭据已经提交或推送过时，应轮换凭据并处理历史泄露。

:::

### 2. 用每台机器自己的变量生成 Pi 设置

适用于不同电脑要使用不同 Pi 默认模型的情况；如果设置完全相同，就保留上面的普通 `settings.json`，无需模板。

先运行 `chezmoi add --template ~/.pi/agent/settings.json`。chezmoi 管理目录中的文件会变为 `dot_pi/agent/settings.json.tmpl`。再用 `chezmoi edit-config` 打开**本机的** `~/.config/chezmoi/chezmoi.toml`，为每台机器填写各自的值：

```toml title="~/.config/chezmoi/chezmoi.toml"
[data.pi]
provider = "anthropic"
model = "替换为此 provider 实际提供的模型 ID"
```

在 chezmoi 管理目录中编辑 `dot_pi/agent/settings.json.tmpl`，把模型字段交给本机变量：

```json title="dot_pi/agent/settings.json.tmpl"
{
  "$schema": "https://pi.dev/schemas/settings.schema.json",
  "defaultProvider": {{ .pi.provider | quote }},
  "defaultModel": {{ .pi.model | quote }}
}
```

如果原来的 Pi 设置文件还有其他选项，保留它们，只把需要变化的值改成模板表达式。这里的 `chezmoi.toml` 保存在本机 `~/.config/chezmoi/`，**不要提交到共享仓库**；模板在每台设备上读取各自的 `data.pi` 值。用 `chezmoi cat ~/.pi/agent/settings.json` 检查生成结果，再执行 `chezmoi diff`、`chezmoi apply`。Pi 正在运行时，执行 `/reload` 重新加载设置。

### 3. 两台设备间传递并应用配置

先把 chezmoi 管理目录的 Git 仓库推送到 GitHub、GitLab 等远端；具体提交命令见前面的“保存到远端仓库”。在另一台设备上：

1. 安装 Pi、Git 和 chezmoi，确认 Pi 使用 `~/.pi/agent` 默认目录。
2. 如使用加密文件，**先安全地准备好该设备的 age 私钥和 chezmoi 本机配置**，再克隆仓库；操作步骤见下一节。
3. 初始化并预览：

   ```sh title="pi-restore.sh"
   chezmoi init https://github.com/YOUR_NAME/dotfiles.git
   chezmoi diff
   chezmoi apply --dry-run --verbose
   chezmoi apply
   ```

4. 若没有同步加密的 `auth.json`，启动 Pi 后执行 `/login`，在这台设备单独登录模型服务。
5. 在 Pi 里执行 `/reload`，让新设置生效。

之后在任一设备修改了 Pi 实际配置，执行 `chezmoi re-add ~/.pi/agent/settings.json` 收回普通文件的修改，再提交和推送 Git 仓库；另一台设备执行 `chezmoi update`、检查差异并应用。模板文件不能用 `re-add` 反推；改模板时应直接编辑 chezmoi 管理目录中的 `dot_pi/agent/settings.json.tmpl`。

### 4. 可选：加密并跨设备同步 `auth.json`

**最简单且推荐的默认做法**是不共享 `auth.json`：保留 `.chezmoiignore` 中的排除规则，在每台设备用 Pi 的 `/login` 分别认证。只有确实需要复制认证文件时才走以下加密流程。age 私钥与 Git 仓库分开保管；私钥绝不能提交。

**第一台设备：生成密钥并加密**

```sh title="pi-age.sh"
mkdir -p ~/.config/chezmoi
chezmoi age-keygen --output ~/.config/chezmoi/age.txt
```

生成的 `~/.config/chezmoi/age.txt` 中包含私钥。运行 `chezmoi age-keygen -y ~/.config/chezmoi/age.txt`，读取 `age1...` 开头的**公钥**。然后运行 `chezmoi edit-config`，确认 `~/.config/chezmoi/chezmoi.toml` 包含以下配置；把 `identity` 改为本机私钥文件的绝对路径，把 `recipient` 改为刚才显示的公钥：

```toml title="~/.config/chezmoi/chezmoi.toml"
encryption = "age"

[age]
identity = "/Users/YOUR_NAME/.config/chezmoi/age.txt"
recipient = "age1..."
```

Windows 上将 `identity` 改为本机实际位置，例如 `'C:\\Users\\YOUR_NAME\\.config\\chezmoi\\age.txt'`。这个 `chezmoi.toml` 和 `age.txt` 都留在本机，不要添加到 Git。

完成 age 配置后，从 `~/.local/share/chezmoi/.chezmoiignore` 中删除或注释 `.pi/agent/auth.json` 这一行，再立即加密添加这个文件；规则未移除时，`add --encrypt` 也会跳过它：

```sh title="pi-auth.sh"
chezmoi add --encrypt ~/.pi/agent/auth.json
```

检查 `~/.local/share/chezmoi/dot_pi/agent/encrypted_auth.json.age` 是否为密文；然后像其他设置一样提交、推送 Git 仓库。加密文件进入共享仓库的是密文，应用时由 chezmoi 在本机解密为 `~/.pi/agent/auth.json`。

**第二台设备：安全取得私钥后再应用**

私钥必须通过你自行控制的安全途径单独传给第二台设备（例如加密 U 盘或可信的密码管理器），不能通过 Git、普通聊天或未加密网盘传输。放到第二台设备自己的 `~/.config/chezmoi/age.txt`，再编辑 `~/.config/chezmoi/chezmoi.toml`，使 `identity` 指向这个文件，`recipient` 保留对应的 `age1...` 公钥。完成后：

```sh title="pi-age-restore.sh"
chezmoi init https://github.com/YOUR_NAME/dotfiles.git
chezmoi diff
chezmoi apply --dry-run --verbose
chezmoi apply
```

两台设备使用**同一份私钥**时，可直接解开该公钥加密的文件。不要把私钥放进 Pi 路径、chezmoi 管理目录、Pi 设置仓库或同步目录。失去私钥会无法解密备份；泄露私钥则可能暴露仓库中所有由它加密的历史密文。

如需**每台设备一份独立私钥**，给每台设备生成自己的 age 密钥，并在各自 `~/.config/chezmoi/chezmoi.toml` 的 `[age]` 下设置本机的 `identity` 和所有可用公钥组成的 `recipients`。`identities` / `recipients` 支持多个值；每份密文加密给所有收件人公钥。新增设备公钥后，在旧设备上执行 `chezmoi re-add --re-encrypt ~/.pi/agent/auth.json`，把密文重新加密给全部公钥，并提交更新后的 `dot_pi/agent/encrypted_auth.json.age`。不要把其他设备的私钥加到本机 `identities`，只配置本机实际持有的私钥；需要备份的密文须至少有一个你仍能安全使用的私钥对应的公钥。

无论加不加密，应用后的 `~/.pi/agent/auth.json` 都是本机可读的明文。加密只保护 Git 仓库里的副本，不替代设备本身的账户保护或 Pi 的重新认证流程。

## 七、进阶功能

### 用模板处理机器差异

打开 `chezmoi edit-config`，合并以下内容；不同机器填写不同邮箱：

```toml title="chezmoi.toml"
[data]
email = "me@example.com"
```

将 Git 配置转为模板并编辑：

```sh title="template.sh"
chezmoi add --template ~/.gitconfig
chezmoi edit ~/.gitconfig
```

将 chezmoi 管理目录中的 Git 配置内容改成模板变量，保留其他已有配置：

```ini title="dot_gitconfig.tmpl"
[user]
    email = {{ .email | quote }}
```

保存后运行 `chezmoi cat ~/.gitconfig` 检查渲染结果，再 `diff`、`apply`。模板还可用 `.chezmoi.os`（`windows` / `darwin` / `linux`）、`.chezmoi.hostname`、`.chezmoi.arch` 做条件判断，`chezmoi data` 可查看可用变量。

### 按系统忽略文件

在**chezmoi 管理目录**创建 `.chezmoiignore`，模式使用实际配置的相对路径，不使用 `dot_` 等管理目录文件名属性：

```text title=".chezmoiignore"
README.md
{{ if ne .chezmoi.os "linux" }}
.config/i3/**
{{ end }}
```

这样只在 Linux 纳管和部署 i3 配置；其他系统会忽略匹配的文件。

| 情况 | `.chezmoiignore` 的作用 |
| :-- | :-- |
| 先写规则，再 `chezmoi add <目录>` | 递归添加时跳过匹配文件，不复制到 chezmoi 管理目录 |
| 执行 `chezmoi apply` | 不改写匹配的实际配置文件 |
| 文件已添加，后来才写规则 | 停止处理匹配文件，但不删除管理目录中已有的副本，也不清除 Git 历史 |

`.gitignore` 则控制 Git 对未跟踪文件的忽略，不代替 chezmoi 的添加或应用规则。两种忽略文件都不会自动撤销已有的 Git 跟踪；提交前仍需检查管理目录和暂存区。

### 加密文件与密码管理器

| 方法 | 适合内容 | 前置条件与边界 |
| :-- | :-- | :-- |
| age / GPG 加密文件 | 必须作为完整文件保存的敏感配置 | 仓库存密文；新机器需另行取得解密密钥，落地文件仍是明文 |
| 1Password / Bitwarden 等模板集成 | Token、密码、少量字段 | 仓库存引用；通常需要对应 CLI、登录和解锁，具体依集成而定 |

以 age 为例，先在本机 `~/.config/chezmoi/` 生成密钥，再读取对应的公钥：

```sh title="age.sh"
chezmoi age-keygen --output ~/.config/chezmoi/age.txt
chezmoi age-keygen -y ~/.config/chezmoi/age.txt
```

生成的 `age.txt` 中包含**私钥**，第二条命令输出 `age1...` 开头的**公钥**。运行 `chezmoi edit-config`，在本机 `~/.config/chezmoi/chezmoi.toml` 中设置：

```toml title="~/.config/chezmoi/chezmoi.toml"
# 顶层配置，放在 [data]、[age] 等表之前
encryption = "age"

[age]
identity = "/Users/YOUR_NAME/.config/chezmoi/age.txt"
recipient = "age1..."
```

`identity` 要换成本机实际的私钥路径；Windows 可写为 `'C:\\Users\\YOUR_NAME\\.config\\chezmoi\\age.txt'`。`recipient` 则换成第二条命令输出的公钥。配置好后，执行 `chezmoi add --encrypt <敏感文件>`，检查管理目录里的加密文件确实为密文，再提交和应用。`chezmoi.toml` 和私钥只留在本机，**不要放进 Pi 配置路径或提交 Git**。

如需把文件部署到另一台设备，必须通过 Git 以外的安全渠道单独传送私钥，然后在第二台设备配置自己的 `identity` 路径和相应的 `recipient`，再执行 `chezmoi init`、`diff` 和 `apply`。如果每台设备使用不同私钥，请把所有设备的公钥都放入 `recipients`；每台设备只配置自己拥有的私钥。应用后的 Pi 实际文件仍是明文，私钥必须单独备份并限制访问；`diff`、`cat` 的输出也可能包含解密内容。

### 自动执行脚本

在 chezmoi 管理目录创建下列命名的脚本，`chezmoi apply` 会按规则执行：

| 命名 | 执行时机 |
| :-- | :-- |
| `run_setup.sh` | 每次应用都执行 |
| `run_once_setup.sh` | 在本机按内容哈希记录；同一份成功执行过的内容不再执行，内容改变后可再次执行 |
| `run_onchange_setup.sh` | 相比上次成功执行，内容变化才执行 |
| `run_once_before_setup.sh` | 在文件更新前，按 `once` 规则执行 |
| `run_onchange_after_reload.sh` | 在文件更新后，按 `onchange` 规则执行 |

脚本可加 `.tmpl` 后缀，通过系统判断控制执行；Windows 可用 `.ps1` 脚本。Shell 脚本需要正确的 shebang（如 `#!/bin/sh`）和解释器。执行记录保存在本机，新机器会重新执行；脚本应能重复执行而不产生额外破坏，`--dry-run` 不执行脚本。

安装软件、重载配置可放在脚本中，但不会自动获得包管理器或系统管理权限。

### 其他按需使用的能力

| 能力 | 入口 | 边界 |
| :-- | :-- | :-- |
| 初始化时询问邮箱等变量 | chezmoi 管理目录 `.chezmoi.toml.tmpl` + `promptStringOnce`；重新生成配置用 `chezmoi init` | 模板生成各机本机配置，别把密钥写死在模板里 |
| 共享模板与数据 | `.chezmoitemplates/`、`.chezmoidata.toml` 等 | 复用多路径配置；仓库中的数据会被 Git 保存 |
| 拉取外部配置或插件 | `.chezmoiexternal.toml`，支持文件、压缩包、Git 仓库 | 建议固定版本；`refreshPeriod` 控制刷新，`chezmoi -R apply` 强制刷新；不适合大型资源 |
| 自动提交与推送 | 本机配置 `[git]` 中启用 `autoCommit`、`autoPush` | 默认关闭；不会监听所有应用对实际配置的修改，误收集的内容可能被直接推送 |
| 精确管理目录 | chezmoi 管理目录中的 `exact_` 属性 | 会删除实际配置目录中未被声明且未被忽略的条目，不要用于混有缓存或运行数据的目录 |
| 检查状态与排错 | `chezmoi verify`、`chezmoi doctor` | 前者检查目标是否符合期望状态，后者诊断运行环境；不会修复 Git 冲突 |

## 八、分类命令速查

`<文件>` 通常指目标路径，例如 `~/.gitconfig`。尖括号内容是占位符，执行时替换，不保留括号。

| 分类 | 命令 | 用途 |
| :-- | :-- | :-- |
| 初始化 | `chezmoi init [仓库地址]` | 创建本地管理目录，或从远端克隆 dotfiles 仓库 |
| 初始化 | `chezmoi source-path` | 查看 chezmoi 管理目录位置 |
| 初始化 | `chezmoi edit-config` | 编辑本机配置 |
| 纳管 | `chezmoi add <文件或目录>` | 收集现有配置，递归处理目录并跳过 `.chezmoiignore` 匹配项 |
| 纳管 | `chezmoi add --template <文件>` | 转为模板管理 |
| 纳管 | `chezmoi add --encrypt <文件>` | 加密后纳管，需先配置加密 |
| 编辑 | `chezmoi edit <文件>` | 修改 chezmoi 管理目录中的文件 |
| 编辑 | `chezmoi edit --apply <文件>` | 编辑结束后自动应用 |
| 编辑 | `chezmoi re-add <文件>` | 收回实际文件的修改，跳过模板 |
| 编辑 | `chezmoi merge <文件>` | 用合并工具将实际修改合入管理文件 |
| 检查 | `chezmoi status` / `chezmoi diff` | 查看部署状态 / 具体差异 |
| 检查 | `chezmoi cat <文件>` | 查看将生成的内容 |
| 检查 | `chezmoi managed` / `chezmoi ignored` | 列出纳管 / 被忽略的路径 |
| 检查 | `chezmoi verify` / `chezmoi doctor` | 验证目标状态 / 诊断环境 |
| 应用 | `chezmoi apply --dry-run --verbose` | 预演变更，不实际写入目标或执行脚本 |
| 应用 | `chezmoi apply [文件]` | 应用全部或指定配置 |
| 同步 | `chezmoi git -- status` | 查看 chezmoi 管理目录中 Git 仓库的状态 |
| 同步 | `chezmoi git -- <Git 参数>` | 在 chezmoi 管理目录中执行 add、commit、pull、push 等 |
| 同步 | `chezmoi update` | 拉取远端 Git 更新并立即应用 |
| 模板 | `chezmoi data` | 查看模板变量，可能含敏感数据 |
| 外部资源 | `chezmoi -R apply` | 强制刷新外部资源并应用 |
| 移除 | `chezmoi forget <文件>` | 停止管理，保留实际文件 |
| 移除 | `chezmoi destroy <文件>` | 删除管理文件和实际文件 |
| 帮助 | `chezmoi <命令> --help` | 查询参数及行为 |

## 参考

- [官方快速开始](https://www.chezmoi.io/quick-start/)
- [日常操作](https://www.chezmoi.io/user-guide/daily-operations/)
- [Pi 配置文件说明](https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/docs/configuration.md)
- [Pi 凭据与认证方式](https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/docs/providers.md)
- [机器差异与模板](https://www.chezmoi.io/user-guide/manage-machine-to-machine-differences/)
- [.chezmoiignore 规则](https://www.chezmoi.io/reference/special-files/chezmoiignore/)
- [age 加密](https://www.chezmoi.io/user-guide/encryption/age/)
- [脚本执行规则](https://www.chezmoi.io/user-guide/use-scripts-to-perform-actions/)
- [外部文件与插件](https://www.chezmoi.io/user-guide/include-files-from-elsewhere/)
