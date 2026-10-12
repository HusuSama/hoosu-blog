---
title: Scoop 使用指南：Windows 下的命令行包管理
createTime: 2026/10/12 10:00:00
permalink: /blog/scoop-guide/
tags:
  - windows
  - scoop
  - 包管理
  - 环境配置
---

[[TOC]]

## 它是什么

[Scoop](https://scoop.sh/) 是 Windows 下的命令行软件包管理器，设计思路类似 macOS 的 Homebrew：

- ==免 UAC 弹窗==、免安装向导，一条命令装完直接能用；
- 所有软件集中在同一目录，通过 shims 目录挂进 `PATH`，不污染环境变量；
- 默认安装"绿色版"（portable）软件，卸载即删目录，无注册表残留；
- 自动解析并安装依赖。

与 winget 的分工：winget 面向商店软件和系统级 MSI 安装（会弹 UAC、写系统区域），Scoop 更适合命令行开发工具链（git、node、python、7zip 这类）。

## 一、安装

### 前置条件

- PowerShell 5.1 及以上（Windows 10+ 自带，`$PSVersionTable.PSVersion` 可查看）；
- 执行策略需允许运行本地脚本。

```powershell title="prepare.ps1"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 官方一键安装（默认目录）

::: warning 默认安装位置
直接复制官方的一行命令，Scoop 会**不做任何询问**地安装到用户目录 `C:\Users\<用户名>\scoop`，之后所有软件也默认装在这里。想自己控制安装位置，请看下一节「自定义安装目录」。

```powershell title="install.ps1"
irm get.scoop.sh | iex
```

:::

### 自定义安装目录（推荐）

先下载安装脚本，再带参数执行，目录**必须是绝对路径**：

```powershell title="install.ps1"
irm get.scoop.sh -outfile 'install.ps1'
.\install.ps1 -ScoopDir 'D:\Scoop' -ScoopGlobalDir 'D:\GlobalScoopApps'
```

常用参数：

| 参数 | 作用 |
| :--- | :--- |
| `-ScoopDir` | Scoop 本体与用户级软件的安装目录 |
| `-ScoopGlobalDir` | 全局安装（`-g`）软件的目录，默认 `C:\ProgramData\scoop` |
| `-NoProxy` | 安装过程中绕过系统代理 |
| `-RunAsAdmin` | 在管理员控制台安装时必须显式指定 |

::: warning 管理员窗口默认禁止安装
出于安全考虑，官方安装脚本在管理员 PowerShell 中会直接拒绝运行。要么在**普通用户**窗口安装，要么明确知道自己要干什么时加 `-RunAsAdmin`。
:::

### 网络不畅时代理安装

```powershell title="proxy-install.ps1"
$env:HTTP_PROXY='http://<ip:port>'
$env:HTTPS_PROXY='http://<ip:port>'
irm get.scoop.sh | iex
```

## 二、软件安装位置怎么配

Scoop 的目录行为由两个环境变量控制：

| 变量 | 作用域 | 控制内容 |
| :-- | :-- | :-- |
| `SCOOP` | 用户级 | Scoop 本体、buckets、缓存、用户级软件 |
| `SCOOP_GLOBAL` | 系统级（Machine） | `scoop install -g` 全局软件的安装位置 |

### 方式一：安装时用参数指定（一次性）

即上一节的 `-ScoopDir` / `-ScoopGlobalDir`，只影响这次安装，最直接。

### 方式二：环境变量（传统方式，持久生效）

```powershell title="env.ps1"
# 用户级安装位置
$env:SCOOP='D:\Scoop'

# 全局安装位置（Machine 级写入需要管理员权限）
$env:SCOOP_GLOBAL='D:\GlobalScoopApps'
[Environment]::SetEnvironmentVariable('SCOOP_GLOBAL', $env:SCOOP_GLOBAL, 'Machine')

irm get.scoop.sh | iex
```

> [!NOTE]
> 必须在**运行安装命令之前**设好变量，安装脚本会把软件固定到这些目录。装完再改环境变量，已有的目录结构不会自动迁移。

### 安装后的目录结构

安装后，所有子目录都挂在 `<安装目录>` 下。以自定义安装到 `D:\Scoop` 为例：

| 路径 | 内容 |
| :-- | :-- |
| `D:\Scoop\apps\<app>\current` | 每个软件一个目录，`current` 指向当前版本 |
| `D:\Scoop\buckets` | 软件清单仓库（每个 bucket 是一个 git 仓库） |
| `D:\Scoop\cache` | 安装包下载缓存 |
| `D:\Scoop\persist` | 软件的持久化配置数据，升级不丢 |
| `D:\Scoop\shims` | 垫片目录，唯一挂进 `PATH` 的位置 |

未自定义目录时，`<安装目录>` 就是 `~\scoop`（即 `C:\Users\<用户名>\scoop`），目录结构完全相同。

### 用户级与全局安装

```powershell title="global.ps1"
scoop install git              # 用户级，无需管理员
sudo scoop install python -g   # 全局，需管理员，装到 SCOOP_GLOBAL
```

> [!TIP]
> 个人开发机全部用用户级即可；只有多账户共用的机器才需要全局安装。

### 配置文件（config.json）

Scoop 有唯一的持久化配置文件，优先级和路径由官方核心（`lib/core.ps1`）决定：

```powershell title="config-path.ps1"
# 设了 XDG_CONFIG_HOME → <XDG>\scoop\config.json
# 否则（默认）      → ~\.config\scoop\config.json

# 特例：便携安装（根目录下有 config.json）→ <根目录>\config.json
```

::: warning 前面"环境变量方式"与这份文件的关系
`scoop config SCOOP xxx` 这类命令写入的就是 `~\.config\scoop\config.json`。读取优先级：**环境变量 `SCOOP` > 配置项 `root_path` > 脚本推断 > `~\scoop`**。环境变量和配置文件同时存在时，环境变量赢。

国内镜像安装脚本（如 scoop-proxy-cn）在你用 `-ScoopDir` 自定义目录时，会自动把该目录写进配置项 `root_path`——这就是"装完没设环境变量也能找回安装目录"的原因。若文件里的 `root_path` 与实际安装位置不一致，且 `$env:SCOOP` 也为空，Scoop 会按脚本推断路径走，这份配置不生效。
:::

常用配置项速查（完整列表见 `scoop config --help`）：

| 分类 | 配置项 | 作用 |
| :-- | :-- | :-- |
| 常用 | `root_path` | Scoop 安装根目录（镜像脚本自动写入） |
| | `global_path` | 全局软件目录，对应 `SCOOP_GLOBAL` |
| | `cache_path` | 下载缓存目录，默认根目录下 `cache` |
| | `scoop_repo` | Scoop 本体的 git 仓库（第三章镜像切源用的就是它） |
| | `scoop_branch` | `master` / `develop`，提前吃未发布功能 |
| | `default_architecture` | `64bit` / `32bit` / `arm64` 安装架构偏好 |
| 行为 | `use_sqlite_cache` | 用 SQLite 缓存加速 `search` / `shim` |
| | `no_junction` | 不建 `current` 别名，shims 直指具体版本 |
| | `force_update` | 强制升级到 bucket 版本 |
| | `ignore_running_processes` | 更新/卸载时忽略正在运行的进程，仅告警 |
| | `show_manifest` / `show_update_log` / `debug` | 安装前显示清单 / 更新不显示日志 / 详细输出 |
| 网络 | `proxy` | `[user:pass@]host:port`；`none` 绕过系统代理 |
| | `gh_token` | GitHub API token，避免 `checkver` 限流 |
| | `private_hosts` | 私有仓库主机 + 认证头 |
| aria2 | `aria2-enabled` / `aria2-split` 等 | 分片下载开关及参数（见前文 aria2 提示） |
| 恶意检查 | `virustotal_api_key` | `scoop virustotal` 扫描用的 API key |

```powershell title="config-usage.ps1"
scoop config                        # 查看全部配置
scoop config root_path              # 查看单项
scoop config proxy 'http://127.0.0.1:7890'   # 设置单项
scoop config rm proxy               # 删除单项
```

## 三、国内镜像加速

Scoop 的痛点：本体、bucket 清单、软件安装包几乎全在 GitHub，国内访问极不稳定。加速分三层：

| 层 | 加速对象 | 方案 |
| :-- | :-- | :-- |
| Scoop 本体 | `update` 拉取核心代码 | 切换 `SCOOP_REPO` 到 Gitee 镜像 |
| Bucket 清单 | `search` / `update` 拉取软件清单 | 添加 Gitee 聚合 bucket（`spc`） |
| 软件安装包 | `install` 下载二进制 | 代理站（`gh-proxy` 类）或本地代理 |

:::: warning 镜像与官网的版本出入
- Gitee 上的 [scoop-installer](https://gitee.com/scoop-installer) 组织镜像官方仓库，**同步频率约 10 天**，新版 Scoop 或新软件清单可能滞后于官网；
- [scoop-proxy-cn](https://github.com/lzwme/scoop-proxy-cn)（`spc`）聚合了 70+ 个第三方 bucket、约 1.4 万个应用，同步更新但**不逐一验证可用性与安全性**；
- 走代理站的下载地址会随代理站失效而变动，不如官方源稳定。

结论：镜像适合"日常装常用工具"；要追最新版本或对来源敏感的软件，建议临时切回官方源或挂代理。
::::


### 方式一：本体仓库切换到 Gitee 镜像

`SCOOP_REPO` 控制 Scoop 从哪个 git 仓库更新核心代码。已装官方版时可平滑切换，之后所有的 `scoop update` 都改为从 Gitee 拉取（命令本身没变，只是走的源变了）：


```powershell title="mirror.ps1"
scoop config SCOOP_REPO "https://gitee.com/scoop-installer/scoop"
scoop update
```

全新安装直接走国内源：

```powershell title="mirror-install.ps1"
irm scoop.201704.xyz -outfile 'install.ps1'
.\install.ps1 -ScoopDir 'D:\Scoop' -ScoopGlobalDir 'D:\GlobalScoopApps'
```


### 方式二：添加 spc 聚合 bucket

`spc` 把数十个 bucket 聚合成一个，托管在 Gitee，克隆和更新都快：

```powershell title="spc.ps1"
scoop bucket add spc https://gitee.com/wlzwme/scoop-proxy-cn.git
scoop update

# 安装时用 spc/ 前缀，避免和其他 bucket 同名软件混淆
scoop install spc/7zip spc/aria2
```

它的 `sync` 分支只同步清单、不改下载地址；`main` 分支会把 GitHub 下载地址改写成 `gh-proxy.org` 代理（代理站不稳定，失效时需重新配置）：

```powershell title="spc-main.ps1"
cd "$env:SCOOP\buckets\spc"   # 未设置 SCOOP 时用 "$env:USERPROFILE\scoop\buckets\spc"
git fetch --all
git checkout -b main origin/main
```

### 方式三：加速软件包下载

Gitee 修改版 scoop 支持给所有下载统一挂代理站：

```powershell title="url-proxy.ps1"
scoop config URL_PROXY "https://gh-proxy.org"
scoop config rm URL_PROXY    # 删除代理
```

官方版可配置本地代理（对 curl 等下载生效）：

```powershell title="local-proxy.ps1"
scoop config proxy 'http://127.0.0.1:7890'
```

::: tip aria2 反而可能导致下载失败
装了 aria2 后 scoop 会走分片下载，但不少代理站不支持或屏蔽分片请求。报奇怪的网络错误时先试试 `scoop config aria2-enabled false`。
:::

## 四、查找与安装软件

### Bucket 机制

软件清单按 bucket 组织，`main`（默认）+ `extras` 就能覆盖绝大多数需求：

```powershell title="bucket.ps1"
scoop bucket add extras        # GUI 应用、main 之外的常用软件
scoop bucket list
```

| 常用 bucket | 内容 |
| :-- | :-- |
| `main` | 默认，命令行/开发类软件 |
| `extras` | 不符合 main 收录标准的常用软件（含 GUI） |
| `versions` | 同一软件的旧版本/预发布版 |
| `java` / `php` | 多版本 JDK / PHP |
| `nerd-fonts` | Nerd Fonts 字体 |
| `nonportable` | 非绿色软件（会触发 UAC） |

### 搜索

```powershell title="search.ps1"
scoop search git        # 按软件名搜索
scoop search hg         # 也能按软件提供的命令名搜索

scoop info git          # 查看某个软件的详细信息
scoop home git          # 打开软件官网
scoop which curl        # 查某个命令实际来自哪个软件
```

> [!TIP]
> 订阅了大量 bucket 后官方 `scoop search`（PowerShell 实现）会明显变慢，可以安装 Go 语言实现的 `scoop install scoop-search`，之后用 `scoop-search <关键词>` 搜索。

### 安装

```powershell title="install-app.ps1"
scoop install 7zip git curl        # 一次装多个，自动处理依赖
scoop install nodejs@22            # 指定版本
scoop install vscode -g            # 全局安装（需管理员）
scoop install app -s               # 跳过哈希校验（镜像清单偶尔校验失败时用）
```

## 五、常用命令速查

```powershell title="cheatsheet.ps1"
scoop list                  # 已安装软件
scoop update                # 更新 scoop 本体 + 所有 bucket 清单
scoop update *              # 更新所有已安装软件
scoop update git            # 更新单个软件
scoop hold nodejs           # 锁定版本，跳过批量更新
scoop unhold nodejs         # 解除锁定
scoop cleanup *             # 删除所有软件的旧版本
scoop cleanup git           # 清理单个软件的旧版本
scoop reset nodejs@20       # 回滚到本地已有的旧版本
scoop virustotal 7zip       # 用 VirusTotal 扫描安装包
scoop config                # 查看 / 修改配置项
scoop help                  # 帮助总览；scoop help install 看单条命令
```

## 六、卸载与清理

### 卸载单个软件

```powershell title="uninstall-app.ps1"
scoop uninstall 7zip        # 卸载软件，persist 中的配置数据默认保留
scoop uninstall 7zip -p     # --purge，连同配置数据一起删干净
```

### 清理空间

安装缓存和旧版本是两个主要的空间占用来源：

```powershell title="cleanup.ps1"
scoop cache show            # 查看缓存占用
scoop cache rm *            # 清空所有安装包缓存
scoop cleanup *             # 删除已升级软件的旧版本目录
```

> [!TIP]
> 建议把 `scoop update *; scoop cleanup *; scoop cache rm *` 放进定期任务，一步完成"更新 + 瘦身"。

### 移除 bucket

```powershell title="bucket-rm.ps1"
scoop bucket rm extras
```

### 彻底卸载 Scoop

::: danger 会连锅端
`scoop uninstall scoop` 会**删除所有通过 Scoop 安装的软件**以及 `persist` 中的全部配置数据，执行前会要求输入 `y` 确认。有需要的数据先备份。
:::

```powershell title="uninstall-scoop.ps1"
scoop uninstall scoop
```

安装损坏、无法正常卸载时，直接强删目录后可重装：

```powershell title="force-remove.ps1"
Remove-Item -Recurse -Force .\scoop
```

---

**参考**

- [ScoopInstaller/Install 官方安装器文档](https://github.com/ScoopInstaller/Install)
- [Scoop 官方仓库与已知 bucket](https://github.com/ScoopInstaller/Scoop)
- [Scoop Wiki](https://github.com/ScoopInstaller/Scoop/wiki)（Quick Start / Commands / Uninstalling Scoop）
- [Gitee scoop-installer 镜像组织](https://gitee.com/scoop-installer)
- [lzwme/scoop-proxy-cn 聚合 bucket](https://github.com/lzwme/scoop-proxy-cn)
