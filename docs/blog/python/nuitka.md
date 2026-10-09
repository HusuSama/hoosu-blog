---
title: Nuitka 打包实战指南
createTime: 2026/10/09 17:01:58
tags:
  - python
  - nuitka
  - 打包
permalink: /blog/w3xlirj5/
---

## 它是什么

[Nuitka](https://nuitka.net/) 是一个把 Python 程序**真正编译为 C 代码再编译为机器码**的编译器，而不是像 PyInstaller 那样把源码和解释器捆绑在一起。用它打包出来的程序：源码不直接可见、启动更快、体积更小，且 standalone/onefile 模式的产物**不依赖目标机器上的 Python 环境**。

| 对比项 | PyInstaller | Nuitka |
| :-- | :-- | :-- |
| 原理 | 打包字节码 + 内嵌解释器 | Python → C → 机器码 |
| 源码保护 | 弱（字节码可还原） | 强（编译为机器码） |
| 程序体积 | 大（捆绑整个环境） | 较小 |
| 启动速度 | 一般（要解包/加载解释器） | 快 |
| 打包耗时 | 快 | 首次慢，启用 ccache 后增量快 |
| 学习成本 | 低 | 中（需要一个 C 编译器） |

一篇流传很广的[博客园 Nuitka 教程](https://www.cnblogs.com/cfld/p/16355904.html)已经把 Nuitka 的价值说得很清楚，但它基于 Nuitka 1.x 时代的参数（`--plugin-enable`、`--windows-disable-console`、`--standalone + --nofollow-imports` 组合等），**其中一部分在 Nuitka 2.x/4.x 已经废弃或行为改变**。本文以 Nuitka 4.2 为基准，按使用频率重新整理，并给出可直接照抄的命令。

> [!note]
> 本文所有命令与产物结构均在 **Nuitka 4.2 + Python 3.14 + macOS（arm64）** 实测通过，Windows 差异处均已标注。

---

## 环境准备

::: steps

1. **准备 Python**

   使用官方 CPython（3.4 - 3.14）。不要用 Microsoft Store 版 Python，Anaconda 可以用但可能有额外问题。

2. **安装 Nuitka**

   ```sh title="安装 Nuitka"
   pip install nuitka

   # 可选：加快 onefile 压缩与依赖分析
   pip install ordered-set zstandard
   ```

3. **准备 C 编译器**

   | 平台 | 编译器 | 说明 |
   | :-- | :-- | :-- |
   | Windows | MSVC（推荐）或 MinGW64 | 装了 Visual Studio 就行；什么都没装时 Nuitka 会**自动下载 MinGW64** |
   | macOS | Clang | 装 Xcode 或 `xcode-select --install` |
   | Linux | GCC >= 5.1 或 Clang | 发行版自带即可 |

4. **（推荐）安装 ccache 加速增量编译**

   ```sh title="安装 ccache（可选）"
   # macOS
   brew install ccache
   # Linux
   sudo apt install ccache
   ```

   Windows + MinGW64 场景 Nuitka 会自带缓存，无需额外安装。

:::

---

## 最常用的编译命令

绝大多数人用 Nuitka 只为一件事：**把 `main.py` 变成一个可以发给别人的可执行文件**。最常用的命令就是这一条：

```sh title="把 main.py 编译成单个可执行文件"
python -m nuitka --mode=onefile --output-dir=build main.py
```

编译完成后，`build/` 里会出现一个独立的二进制（Windows 下是 `main.exe`，macOS/Linux 下是 `main.bin`），把它发给别人即可直接运行，**对方不需要安装 Python 和任何依赖**。

一个更贴近日常的 GUI 程序完整示例（PySide6 界面 + 图标 + 去掉黑控制台窗口）：

```sh title="GUI 程序常用完整示例"
python -m nuitka --mode=onefile \
  --enable-plugins=pyside6 \
  --windows-console-mode=disable \
  --windows-icon-from-ico=icon.ico \
  --output-dir=build \
  main.py
```

> [!tip]
> 示例里的 `\` 是 bash / zsh 的换行续行符。**Windows PowerShell 用户请把命令写成一行，或改用反引号 `` ` `` 续行**；cmd 用户用 `^`。

::: tip 官方推荐的工作流：先 standalone，再 onefile
onefile 只是 standalone 的外层包装（自解压 + 自解压后启动）。**缺文件、缺 DLL 这类问题在 standalone 模式下远比 onefile 好排查**，所以正确的顺序是：

```sh title="两步走"
# 第一步：先用 standalone 验证程序能跑
python -m nuitka --mode=standalone --output-dir=build main.py

# 第二步：确认没问题后，切换 onefile 交付
python -m nuitka --mode=onefile --output-dir=build main.py
```

:::

### 编译模式速览

| 模式 | 产物 | 适用场景 |
| :-- | :-- | :-- |
| `--mode=accelerated`（默认） | 单个二进制，**依赖本机 Python** | 只想加速自己机器上的程序 |
| `--mode=standalone` | 一个文件夹（`main.dist/`），内含入口 | **交付给他人 / 排查问题** |
| `--mode=onefile` | 单个自解压可执行文件 | 交付给他人（分发最简单） |
| `--mode=app` | onefile；但在 macOS 上生成 `.app` | 桌面应用 |
| `--mode=app-dist` | standalone；但在 macOS 上生成 `.app` | 桌面应用（不压缩） |
| `--mode=module` / `package` | `.pyd` / `.so` 扩展模块 | 给未编译的 Python 项目当模块用 |

### onefile 的适用边界：都能编，但不是都适合

先回答一个常见疑问：**是不是所有程序都能打包成 onefile？——是。** onefile 没有独立的能力限制，它就是给 standalone 结果套一层自解压壳：依赖分析、插件、数据文件打包全部在 standalone 阶段完成，不存在“只能 standalone、编不成 onefile”的程序。

那为什么前文反复强调“先 standalone 再 onefile”？那只是**排障策略**，不是能力限制：onefile 出问题（缺文件、缺 DLL）和 standalone 完全同源，而 standalone 直接翻 `main.dist` 目录就能看到缺了什么，onefile 还得先解压才能检查。

但有四类场景，onefile 在**运行期**不合适：

| 场景 | 问题 | 缓解或替代 |
| :-- | :-- | :-- |
| 高频启动的 CLI 工具、数百 MB 的大程序 | 默认每次冷启动都要完整解压到临时目录 | 用 `--onefile-tempdir-spec={CACHE_DIR}/{COMPANY}/{PRODUCT}/{VERSION}` 固定解包路径后，解压结果会保留在缓存里，仅首次与版本变更时重新解压；或直接改用 standalone |
| 运行时要修改“随包文件”的配置 | onefile 的资源是临时目录里的只读副本，改了也白改（退出即删） | 这类文件不要内置，放 exe 旁边（`app_dir()`），首次运行生成 |
| TEMP 分区紧张的环境 | 启动时临时占用约等于整个 dist 的体积 | 改用 standalone；或把缓存路径指向大盘 |
| 杀软敏感环境 | 自解压 + 未签名的单 exe 更容易被误报 | 代码签名；或 standalone + 安装包交付 |

> [!note]
> 官方对 Nuitka onefile 的解压速度相当自信（zstandard 优化过，比 PyInstaller 的 onefile 快得多），“启动慢”只在包体大或每次都冷解压时才明显。Playwright 这种带浏览器的大程序就是典型——见[ Playwright 专项](#playwright-专项)里的建议：优先 standalone。

::: details 老教程参数对照（重要）
网上教程（包括前文提到的博客园文章）的很多写法已经过时：

| 老写法 | 现状 | 新写法 |
| :-- | :-- | :-- |
| `--standalone` / `--onefile` | 仍可用（隐藏别名），帮助里已不显示 | `--mode=standalone` / `--mode=onefile` |
| `--plugin-enable=xxx` | 废弃 | `--enable-plugins=xxx` |
| `--windows-disable-console` | 废弃 | `--windows-console-mode=disable` |
| `--standalone` + `--nofollow-imports` | **4.x 明确不可用**（`--nofollow-imports` 不允许用于 standalone） | 见[下文"裁剪依赖"](#裁剪依赖减小体积) |

:::

---

## 修改产物名称（高频）

编译出来的东西叫什么名字？默认情况下，**所有名字都跟主文件名走**：`main.py` 编译后得到 `build/main.bin`（Windows 下 `main.exe`）、`main.dist/` 目录和 `main.build/` 中间目录。想改名有三种方式，按推荐顺序：

### 方法一：改主文件名（最治本）

把 `main.py` 改成 `myproduct.py`，所有产物名自动联动（实测：`myproduct.dist/myproduct.bin` + `myproduct.build/`）：

```sh title="改主文件名，一劳永逸"
python -m nuitka --mode=standalone --output-dir=build myproduct.py
```

适合项目初期；文件名已经固定、不好改时用下面两个参数。

### 方法二：--output-filename 改可执行文件名

```sh title="给二进制换名"
python -m nuitka --mode=standalone \
  --output-filename=myapp \
  --output-dir=build main.py
```

各平台/模式下的实测行为：

| 场景 | 传 `myapp` 得到 | 说明 |
| :-- | :-- | :-- |
| Windows（standalone/onefile） | `myapp.exe` | **自动补 `.exe`**；直接写 `myapp.exe` 也行 |
| macOS / Linux（standalone） | `main.dist/myapp` | 名字原样生效，**不会再加 `.bin`**；只改 dist 内二进制名，路径部分被忽略 |
| macOS / Linux（onefile） | `build/myapp` | 决定最终单文件的名字，允许带相对路径 |

### 方法三：--output-folder-name 改分发目录名

standalone 交付时不想叫 `main.dist`？实测 `--output-folder-name=MyApp` 会生成 `MyApp.dist/`，并且中间目录同步变成 `MyApp.build/`（`.dist` / `.app` 后缀自动附加，无法去掉）：

```sh title="名称三件套一起指定"
python -m nuitka --mode=onefile \
  --output-filename=MyApp \
  --output-folder-name=MyApp \
  --output-dir=build main.py
```

Windows 下的实测产物就是 `build/MyApp.exe`（onefile）；standalone 则是 `build/MyApp.dist/MyApp.exe`。

::: tip 交付后手动改名也安全（实测）
dist 文件夹整体改名、dist 内二进制改名、onefile 单文件改名，三者编译后手动重命名都能正常运行：程序按**自身位置**定位依赖，`{PROGRAM}` / `{PROGRAM_BASE}` 等路径模板变量在运行期从实际文件名展开，改名后依然正确。

只有一点注意：产物与 `main.build` 中间目录的对应关系靠名字约定，改名后重新排障时别混淆。
:::

### 别混淆：--output-filename ≠ --product-name

一个改文件，一个改元数据，职责完全不同：

| | `--output-filename` | `--product-name` |
| :-- | :-- | :-- |
| 管什么 | 磁盘上的**物理文件名**（用户双击的那个） | 系统元数据里的**产品名**，不改文件名 |
| 效果 | `myapp` → `myapp.exe` | exe 照样叫 `main.exe`，但属性面板“产品名称”显示 `MyApp` |
| 默认值 | `<主文件名>.bin` / `.exe` | 二进制文件名的 basename（不设就隐式取文件名） |

`--product-name` 属于版本信息组（同组还有 `--company-name`、`--file-version`、`--product-version`、`--copyright`），实际用途有四个：Windows 右键属性的“产品名称”、Windows NSIS 安装向导里显示的产品名、Linux `--mode=app` 生成桌面入口的 `Name=`（应用菜单里显示的名字）、以及**运行期路径模板 `{PRODUCT}` 变量的取值**。

::: warning 想用固定解包目录，必须设 --product-name
常见的 onefile 优化写法：

```sh
--onefile-tempdir-spec={CACHE_DIR}/{COMPANY}/{PRODUCT}/{VERSION}
```

其中 `{PRODUCT}` 就取自 `--product-name`（默认回退到文件名），`{COMPANY}` 取自 `--company-name`，`{VERSION}` 取自 `--product-version`。不设置它们，展开出来的路径就是主文件名 + 空公司段，语义全变了。
:::

实战建议：平时改名用 `--output-filename`；正经发布（要版本信息、安装器、桌面图标名称）时两个都设。

---

## 三种配置方式

Nuitka **没有** INI/JSON 式的"全局配置文件"。它的配置入口有三种：命令行参数、主文件内的 `nuitka-project` 注释、构建系统的 `pyproject.toml`/`setup.py`。三者可以混用，命令行参数优先级最高。

### 方式一：命令行直接传参

就是前面示例的写法，适合**小项目、临时编译、CI 脚本**：

```sh title="命令行配置"
python -m nuitka --mode=onefile --enable-plugins=pyside6 \
  --include-data-files=config.json=config.json \
  --output-dir=build main.py
```

优点是所见即所得；缺点是参数一多就难维护，也容易在文档、CI、同事之间产生不一致。

### 方式二：主文件注释（官方推荐）

把参数写进被编译的主文件开头的注释里，Nuitka 编译 `main.py` 时会自动读取：

```python title="main.py"
# nuitka-project: --mode=onefile
# nuitka-project: --enable-plugins=pyside6
# nuitka-project: --include-data-files={MAIN_DIRECTORY}/config.json=config.json
# nuitka-project: --windows-icon-from-ico={MAIN_DIRECTORY}/icon.ico

import sys
from PySide6.QtWidgets import QApplication, QLabel

app = QApplication(sys.argv)
label = QLabel("Hello Nuitka")
label.show()
sys.exit(app.exec())
```

之后只需要一条最短的命令就能编译：

```sh title="注释配置后，命令行极简"
python -m nuitka main.py
```

支持四个指令：

| 指令 | 作用 |
| :-- | :-- |
| `# nuitka-project:` | 写一条普通参数 |
| `# nuitka-project-if:` | 条件成立时应用下面缩进的参数（Python 表达式） |
| `# nuitka-project-else:` | 条件不成立时应用 |
| `# nuitka-project-set:` | 定义变量，`KEY = 表达式`（表达式按 Python 求值） |

注释必须从**行首**开始，缩进用于表示条件块结束（和 Python 语法一致）。变量用 `{VAR}` 展开，内置变量分两类。

**编译期变量**（解析注释时展开为真实值）：

| 变量 | 展开为 |
| :-- | :-- |
| `{MAIN_DIRECTORY}` | 主文件所在目录（确切语义见下文，**写相对路径必用**） |
| `{OS}` | 运行平台：`Linux` / `Windows` / `Darwin`（macOS）等 |
| `{Arch}` | CPU 架构：`x86_64` / `arm64` 等 |
| `{Flavor}` | Python 发行版：`CPython` / `Anaconda` 等 |
| `{Version}` | Nuitka 自身版本，如 `4.2.2` |
| `{PYTHON_VERSION}` | Python 版本，如 `3.14` |
| `{PYTHON_VERSION_FULL}` | Python 完整版本号，如 `3.14.8` |
| `{GIL}` | 当前 Python 是否带 GIL（自由线程版为 `False`） |
| `{Commercial}` | Nuitka Commercial 版本号，社区版为空 |
| `{Linux_Distribution_Name}` 等 | 仅 Linux：发行版名称 / 基名 / 版本号 |
| `{WindowsRelease}` | 仅 Windows：如 `Win10` / `Server2022` |
| 自定义变量 | `nuitka-project-set:` 定义的名字，可直接 `{MY_VERSION}` 引用 |

**运行期模板变量**（在注释里**不会**展开，原样传给参数，程序运行时才求值）：

| 变量 | 运行时取值 |
| :-- | :-- |
| `{PROGRAM}` / `{PROGRAM_BASE}` | 可执行文件自身路径（带/不带扩展名） |
| `{PROGRAM_DIR}` | 可执行文件所在目录 |
| `{CACHE_DIR}` / `{HOME}` | 用户缓存目录 / 用户主目录 |
| `{COMPANY}` / `{PRODUCT}` / `{VERSION}` | 取自 `--company-name` / `--product-name` / `--product-version` |
| `{NONE}` / `{NULL}` | 空值占位 |

它们专供 `--onefile-tempdir-spec`、`--force-stdout-spec` 这类“路径模板”参数使用（见[修改产物名称](#别混淆-output-filename-product-name)一节的例子）；把它们写进 `-if:` 条件表达式是拿不到值的。

#### {MAIN_DIRECTORY} 的确切语义（高频混淆点）

它的定义是**主文件路径去掉文件名**——但注意，是**你在命令行里敲的那个路径原样**，不会规范化成绝对路径（源码即 `os.path.dirname(你敲的路径) or "."`）。四种调用方式实测：

| 调用方式 | `{MAIN_DIRECTORY}` 展开为 |
| :-- | :-- |
| `nuitka main.py`（在 main.py 目录下执行） | `.` |
| `uv run nuitka main.py`（项目根即 main.py 所在地） | `.` |
| `nuitka proj/main.py`（从上级目录调用） | `proj`（相对路径！） |
| `nuitka /abs/path/proj/main.py`（绝对路径调用） | `/abs/path/proj` |

所以 `uv run nuitka main.py` 这种最常见用法里，`{MAIN_DIRECTORY}/config.json` 展开成 `./config.json`——它确实表现为相对路径，但锄点是**你调用 nuitka 时所在的目录**。日常 `uv run` / 脚本都在项目根执行，而根目录恰好就是 main.py 的目录，所以不会翻车；本质规则要记住：

::: warning 裸相对路径 ≠ {MAIN_DIRECTORY}
同样从上级目录执行 `nuitka proj/main.py`，两条注释的实测行为：

```text
# nuitka-project: --include-data-files=nope.txt=nope.txt
              → 解析为 ./nope.txt（相对调用时的 cwd，跟 main.py 在哪无关！）

# nuitka-project: --include-data-files={MAIN_DIRECTORY}/nope.txt=nope.txt
              → 解析为 proj/nope.txt（锄定 main.py 所在目录）
```

结论：**注释里凡是引用主文件旁边的资源，一律带 `{MAIN_DIRECTORY}/` 前缀**。否则在项目根执行一切正常，换个目录调用就“找不到文件”。
:::

::: tip CI / 脚本调用的稳妥姿势
`{MAIN_DIRECTORY}` 的值取决于你在命令行里怎么写主文件路径（在哪个目录调用、用相对还是绝对路径都会影响它）。CI 里推荐二选一：

- 每次先 `cd` 到 main.py 所在目录再调用，`{MAIN_DIRECTORY}` 恒为 `.`；
- 或用绝对路径调用 `nuitka "$PWD/proj/main.py"`，`{MAIN_DIRECTORY}` 恒为绝对路径。

只要不混用，两种都稳定。
:::

跨平台项目的实战模板：

```python title="main.py（跨平台注释配置模板）"
# Windows 出单文件，其他平台出文件夹
# nuitka-project-if: {OS} == "Windows":
#    nuitka-project: --mode=onefile
# nuitka-project-else:
#    nuitka-project: --mode=standalone

# 从代码里取版本号写进 exe 版本信息
# nuitka-project-set: MY_VERSION = __import__("myapp").__version__
# nuitka-project: --product-version={MY_VERSION}

# Windows GUI 程序：不弹控制台、带图标
# nuitka-project-if: {OS} == "Windows":
#    nuitka-project: --windows-console-mode=disable
#    nuitka-project: --windows-icon-from-ico={MAIN_DIRECTORY}/icon.ico
#    nuitka-project: --enable-plugins=pyside6
```

### 方式三：pyproject.toml / setup.py

适合**已经有 Python 打包体系**（ Poetry / setuptools / uv）的项目。在 `pyproject.toml` 中加一个 `[tool.nuitka]` 段，键名就是去掉 `--` 的参数名：

```toml title="pyproject.toml"
[project]
name = "myapp"
version = "1.0.0"

[tool.nuitka]
mode = "onefile"
enable-plugin = "pyside6"
nofollow-import-to = ["*.tests", "*.distutils"]
```

两种入口：

```sh title="以项目方式构建"
# Nuitka 4.0+：项目目录下直接构建，自动读取 pyproject.toml / setup.py / setup.cfg
python -m nuitka --project

# 或者走标准 wheel 构建后端（产物是编译好的 wheel）
pip install build
python -m build
```

布尔值写 `true` 会展开成 `--参数`，`false` 展开成 `--no-前缀`；列表会重复多次传递。注意两点：这里的相对路径同样相对**执行时的 cwd**（`[tool.nuitka]` 最终会还原成命令行参数），习惯在项目根目录执行；数据文件由 setuptools 的 `package_data` 负责，不走 Nuitka 的数据文件参数。

### 怎么选

:::: card-grid

::: card title="方式一：命令行" icon="mdi:console-line"
小脚本、临时验证、CI 单行命令。参数少时最直接。
:::

::: card title="方式二：主文件注释（推荐）" icon="mdi:comment-check-outline"
配置跟着代码走，支持条件与变量，跨平台项目首选。`main.py` 之外的文件不生效。
:::

::: card title="方式三：pyproject.toml" icon="mdi:file-cog-outline"
已有打包体系的库项目、需要产出 wheel 时使用。普通单文件程序用它属于杀鸡用牛刀。
:::

::::

> [!info]
> 还有一类 YAML 配置文件（`*.nuitka-package.config.yml`，通过 `--user-package-configuration-file` 传入），但它**不是**项目的编译配置，而是给第三方包"补 DLC"用的兼容性配置——补缺失的 DLL、数据文件、隐式导入。见[常见问题](#常见问题排障)。

---

## 常用参数速查（按使用频率分级）

### 第一梯队：几乎每次都用

| 参数 | 说明 |
| :-- | :-- |
| `--mode=onefile` / `standalone` | 编译模式，二选一，见前文速览表 |
| `--output-dir=build` | 所有产物（build/dist/onefile）的输出目录，强烈建议指定 |
| `--output-filename=app` | 产物命名。Windows 自动补 `.exe`；standalone 控制的是 dist 内入口文件名，onefile 控制最终单文件名，详见[修改产物名称](#修改产物名称-高频) |
| `--output-folder-name=MyApp` | 分发目录改名：`main.dist` → `MyApp.dist`，中间目录同步联动 |
| `--enable-plugins=pyside6` | 启用标准插件。GUI 框架（`pyside6` / `pyqt6` / `tk-inter`）几乎必用，`--plugin-list` 查看全部 |
| `--include-data-files=源=目标` | 打入单个/一批数据文件，如 `--include-data-files=logo.png=assets/logo.png` |
| `--include-data-dir=源目录=目标目录` | 整个目录递归打入，如 `--include-data-dir=templates=templates` |
| `--include-package-data=包名` | 自动带上某个包自带的数据文件（如 `--include-package-data=customtkinter`），优先用这个而不是手工猜路径 |
| `--windows-icon-from-ico=icon.ico` | exe 图标（也接受 .png），可多次给多分辨率 |
| `--windows-console-mode=disable` | GUI 程序关闭控制台黑窗（`force` 默认 / `attach` / `hide` / `disable`） |
| `--remove-output` | 编译完删除 `*.build` 中间目录 |

`--include-data-files` 的四种形态，目标路径都以 **dist 目录（程序根目录）** 为基准：

```text title="include-data-files 语法"
单个文件   --include-data-files=/path/some.txt=docs/some.txt
通配到多个 --include-data-files=/path/*.txt=docs/          （目标以 / 结尾）
递归三段式 --include-data-files=/path=docs=**/*.txt         （保结构，只拷匹配项）
反悔排除   --noinclude-data-files=docs/*.tmp                （匹配的是目标路径）
```

> [!caution]
> **代码不是数据文件**
>
> `.py`、`.pyd`、`.dll`、`.so`、`.exe` 这类**代码文件不会被数据文件参数打包**——Nuitka 会刻意忽略它们，因为直接拷贝到别的机器上大概率不能工作。Python 代码要用 `--include-module` / `--include-package`，动态加载的 DLL 要走 YAML 包配置文件的 `dlls` 段。

### 第二梯队：按需使用

| 参数 | 说明 |
| :-- | :-- |
| `--include-module=xxx` / `--include-package=xxx` | 强制包含动态导入而 Nuitka 分析不到的模块/包。与 `--follow-import-to` 的区别见[易混淆参数辨析](#带上代码与资源-易混淆参数辨析) |
| `--nofollow-import-to=*.tests` | 按模式排除模块，减小体积（如 `*.tests`、`*.distutils`） |
| `--jobs=N` | C 编译并行度，默认全核 |
| `--python-flag=no_site` 等 | 传给程序内嵌的 Python 行为开关，常用 `no_site` 提速启动 |
| `--onefile-tempdir-spec=...` | onefile 解包目录，默认 `{TEMP}/onefile_{PID}_{TIME_US}_{RANDOM}`（每次全新、退出即删）。写死成如 `{CACHE_DIR}/{PRODUCT}/{VERSION}` 可缓存复用，也能解决 Windows 防火墙反复弹窗 |
| `--product-name` `--company-name` `--product-version` `--file-version` `--copyright` | 版本资源信息（Windows 文件属性、Linux app 元数据） |
| `--macos-create-app-bundle` / `--mode=app` | macOS 生成 `.app`；Linux `--mode=app` 生成 `.desktop` |
| `--windows-create-installer` | Windows 生成 NSIS 安装包（`xxx-setup.exe`） |
| `--macos-create-installer` / `--linux-create-installer` | macOS 生成 DMG / Linux 生成 AppImage（Nuitka 4.2+） |
| `--windows-uac-admin` | 请求管理员权限运行 |

### 第三梯队：调试排障时才用

| 参数 | 说明 |
| :-- | :-- |
| `--report=compilation-report.xml` | 生成编译报告：包含哪些模块、为什么包含、DLL、数据文件。**报 issue 前必带** |
| `--verbose` | 输出详细过程（非常多），可配 `--verbose-output=文件` 落盘 |
| `--show-memory` | 内存统计 |
| `--assume-yes-for-downloads` | 自动下载编译器等，CI 必备 |
| `--progress-bar=none` | 关进度条（CI 日志友好）；`--show-progress` 已废弃 |
| `--clang` / `--msvc=14.3` / `--mingw64` | 强制指定 C 编译器 |

### 裁剪依赖、减小体积

standalone/onefile 模式默认**跟随所有 import**，正确性最好。老教程"只编译自己的代码 + 手动把 numpy/cv2 拷进 dist"的做法在新版已经行不通（`--nofollow-imports` 不允许用于 standalone），正确姿势是让 Nuitka 自己裁剪：

```sh title="推荐做法：交给 Nuitka 裁剪"
python -m nuitka --mode=standalone \
  --nofollow-import-to="*.tests" \
  --nofollow-import-to="matplotlib.tests" \
  --output-dir=build main.py
```

Nuitka 内置了一份针对常见大包（numpy、pandas、torch…）的裁剪配置（`standard.nuitka-package.config.yml`），多数情况下体积已经足够克制。真正遇到“带多了/带漏了”再手动干预。

---

## 带上代码与资源：易混淆参数辨析

`--include-module`、`--include-package`、`--include-package-data`、`--follow-import-to`……这组名字长得最像的参数，是 Nuitka 新手最容易选错的地方。先记住心智模型：Nuitka 眼里只有两条世界线，两套参数各管一条、互不越界：

:::: card-grid

::: card title="代码世界线" icon="mdi:code-braces"
跟着 import 走。`follow` 家族控制**跟随策略**（跟随的前提是静态分析能看到）；`include` 家族**无条件强制打入**（专治静态分析看不到的动态导入）。

`.py` 编译进二进制，`.pyd`/`.so`/`.dll` 作为扩展依赖处理。
:::

::: card title="数据世界线" icon="mdi:file-image-outline"
不跟着 import 走，必须显式声明。`data` 家族（`--include-data-files` / `--include-data-dir` / `--include-package-data`）只搬**非代码文件**。代码文件会被它刻意忽略。

包默认**不带**任何数据文件（除非 Nuitka 内置配置认识它）。
:::

::::

### 先看两个盲区：默认行为实测

standalone 模式默认“跟随所有静态 import”，听起来万事自动，但实测一个含动态导入 + 数据文件的项目，有两个默认盲区（以下全部为真实编译实验结果，实验设一个 `mypkg` 包，含静态导入的 `mod_a`、动态导入的 `mod_dyn`、数据 `data/words.txt`）：

| 编译方式 | 静态 import `mod_a` | 动态导入 `mod_dyn`（模块名来自环境变量） | 包数据 `words.txt` |
| :-- | :-- | :-- | :-- |
| 源码运行（对照） | ==加载== ✓ | ==加载== ✓ | ==存在== ✓ |
| standalone 基准（无参数） | ==自动跟随编译== ✓ | ==ImportError== ✗ | ==缺失== ✗ |
| standalone + `--include-module=mypkg.mod_dyn` | ✓ | ==强制打入== ✓ | 仍缺失 ✗ |
| standalone + `--include-package-data=mypkg` | ✓ | 仍 ImportError ✗ | ==文件进 dist== ✓ |
| accelerated 基准（无参数） | ==不编译==，运行靠本机环境 | 不编译 | 不打包 |
| accelerated + `--follow-import-to=mypkg` | ==编译嵌入== ✓ | ✗（之前“能跑”其实是读到了本机源码，移走源码后立刻 ImportError） | ✗ |

四条结论：

1. **静态 import 全自动**——standalone 默认跟随，什么都不用加；
2. **动态导入是盲区**，只有 `--include-module` / `--include-package` 能救，`--follow-import-to` 救不了；
3. **包数据是另一个独立盲区**，只有 `data` 家族能救，`--include-module` 不带数据（两套参数互不越界的证据）；
4. `--follow-import-to` 的用武之地主要在 accelerated 模式（见下）。

### 家族对照表

**follow 家族（编译跟随策略，只影响“静态可见”的 import）：**

| 参数 | 语义 |
| :-- | :-- |
| `--follow-imports` | 跟随所有 import。standalone 默认**开**，accelerated 默认**关** |
| `--follow-import-to=模块/包` | **如果被用到**，才跟随它（帮助原文：*if used*）——扩大跟随白名单 |
| `--nofollow-import-to=模式` | 即使被用到也不跟随，支持 `*.tests` 通配（优先级最高，覆盖其他包含规则） |
| `--nofollow-imports` | 全不跟随。standalone 下**禁止使用** |

**include 家族（无条件打入，无视静态分析，只管代码）：**

| 参数 | 语义 |
| :-- | :-- |
| `--include-module=` | 强制包含单个模块，如 `mypkg.mod_dyn` |
| `--include-package=` | 强制包含整个包（含子包），可配 `--nofollow-import-to=*.tests` 排除测试 |
| `--include-plugin-directory=` / `--include-plugin-files=` | 按目录/通配抓文件，无视一切规则。官方建议仅在特殊场景用（导入路径不在 sys.path 的遗留代码等） |

**data 家族（只管非代码文件）：**

| 参数 | 语义 |
| :-- | :-- |
| `--include-data-files=源=目标` | 按路径精确指定，适合项目自己的资源 |
| `--include-data-dir=源=目标` | 整目录递归拷入 |
| `--include-package-data=包名` | **按 Python 包名**找到它自带的非代码文件，适合第三方包资源（可加 `:*.png` 过滤），不知道包装在哪也能加 |
| `--include-distribution-metadata=包名` | 补包的元数据（版本号、entry points），包运行时自检版本/importlib.metadata 查询需要时加 |

### 按报错反查：什么时候用哪个

| 你遇到的报错/需求 | 用什么 |
| :-- | :-- |
| 运行时报 `ModuleNotFoundError`，模块名是字符串动态拼出来的 | `--include-module=那个模块`；整个插件体系用 `--include-package=插件包` |
| 运行时报 `FileNotFoundError`，读的是第三方包内资源 | `--include-package-data=那个包`（先 `--list-package-data=包名` 看看它有什么） |
| 读的是项目自己目录下的文件 | `--include-data-files` / `--include-data-dir` |
| 包运行时检查自己的版本抛异常 | `--include-distribution-metadata=包名` |
| accelerated 模式只想编译自己的代码、不编译标准库和第三方（加速不交付） | `--follow-import-to=自己的包` |
| 体积太大，确认某些子包用不到 | `--nofollow-import-to=模式` |

::: tip 什么算“静态可见”？
实验中一个反直觉发现：`importlib.import_module("mypkg" + "." + "mod_dyn")` 这种**纯常量拼接**的模块名，Nuitka 编译期会常量折叠照样分析到，不需要 include；而 `os.environ.get("DYN_MOD")` 这种运行期才确定的才是真空区。拿不准就编译后实际运行验证，别凭感觉。
:::

::: warning 加速模式交付警告
实验中 accelerated + `--follow-import-to=mypkg` 的产物有极强的迷惑性：在本机“看起来一切正常”（动态导入、读数据文件都成功）——那是因为**本机源码还在原地**，运行时直接读了源码目录（路径在编译期被固化进二进制）。把源码目录移走立刻暴露。所以加速模式只适合自用加速，交付永远用 standalone/onefile。
:::

---

## 产物结构：编译出来的是什么

### standalone：一个文件夹

```sh title="编译"
python -m nuitka --mode=standalone --output-dir=build main.py
```

::: file-tree icon="colored" title="build/ —— standalone 产物"

- build
  - main.build # 中间产物：生成的 C 源码、目标文件，交付时可删除
  - main.dist # **交付单位：整个文件夹都是程序**
    - main.bin **运行入口** # Windows 下叫 main.exe
    - libpython3.14.dylib # Python 运行时，Windows 下是 python314.dll
    - \*.so # 内置标准库的 C 扩展（Windows 为 .pyd）
    - config.json # 你用 --include-data-files 打进来的资源
    - playwright/ # 用到 playwright 时，driver 浏览器都在这
  :::

**哪个是运行文件？——`main.dist` 里与你源文件同名的那个**（Windows `main.exe`，macOS/Linux `main.bin`），其余 `.so`/`.dll` 都是它的依赖。

**哪部分是根目录？——`main.dist/` 整个目录就是程序根目录。** 你用 `--include-data-files=xxx=assets/xxx` 指定的目标路径、程序内 `os.path.dirname(__file__)` 定位的资源，全部落在这个根目录下。程序对 `dist` 目录**外部**没有任何文件依赖，所以交付时把它当成一个不可拆的整体。

### onefile：一个文件

```sh title="编译"
python -m nuitka --mode=onefile --output-dir=build main.py
```

::: file-tree icon="colored" title="build/ —— onefile 产物"

- build
  - main.bin **交付物：单文件运行入口** # Windows 下叫 main.exe
  - main.build # 中间产物，不交付
  - main.dist # 中间产物（onefile 的打包原料），不交付
  - main.onefile-build # 中间产物，不交付
  :::

onefile 二进制运行时会**解压到临时目录再启动**（默认 `{TEMP}/onefile_{PID}_{TIME_US}_{RANDOM}`，退出即删）。这个临时目录**不是**你的"程序目录"，`main.build` / `main.dist` / `main.onefile-build` 是构建中间物，交付时一个都不要发，只发那一个二进制。

### 程序里怎么定位文件（最容易踩的坑）

编译后程序里有三个"位置指针"，含义完全不同：

| 指针 | standalone | onefile | 含义 |
| :-- | :-- | :-- | :-- |
| `os.path.dirname(sys.argv[0])` | dist 内、入口旁边 | exe 旁边 | **外部文件该放的地方** |
| `__compiled__.containing_dir` | dist 目录的外一层 | exe 旁边 | "交付包旁边"（macOS app 模式是 `.app` 外层） |
| `os.path.dirname(__file__)` | dist 内（资源目录） | 临时解包目录 | **内置只读资源**所在 |

实测对比（onefile 运行 `main.bin` 时的输出）：

```text title="onefile 下运行 main.bin 的真实输出"
sys.argv[0]  = /Users/me/build/main.bin
__file__     = /var/folders/.../onefile_25821_.../main.py   # 解包临时目录，退出即删
app_dir      = /Users/me/build
```

于是通用定位模板可以这样写（对编译/未编译、standalone/onefile 全部适用）：

```python title="main.py（资源定位模板）"
import os
import sys


def app_dir():
    """程序所在目录：放配置、用户数据、外部传入文件的地方。"""
    try:
        return __compiled__.containing_dir  # noqa: F821
    except NameError:
        # 未编译时（直接 python main.py）回退
        return os.path.dirname(os.path.abspath(sys.argv[0]))


def resource_dir():
    """内置资源目录：--include-data-files 打进来的文件都在这。"""
    return os.path.dirname(os.path.abspath(__file__))


# 外部文件：放在 exe / main.dist 旁边
config_path = os.path.join(app_dir(), "config.json")
# 内置资源：随程序分发、只读
logo_path = os.path.join(resource_dir(), "assets", "logo.png")
```

::: warning 两条铁律

- **永远不要用 `os.getcwd()` 或相对路径 `"data/xxx"`** 定位资源。用户从别的目录双击 exe 时当前目录完全不受你控制。改完养成习惯：在源码目录外用 `python ../main.py` 跑一遍，能跑通再编译。
- **用户会产生修改的文件（配置、输出、上传的数据）不要用 `--include-data-files` 内置**。onefile 模式下它们被解到临时目录，用户改完一重启就没了；正确做法是首次运行时在 `app_dir()` 下生成默认配置。

:::

### 判断：源码运行还是编译后运行

调试日志、开发期热重载、错误上报……很多行为需要“知道自己是不是编译产物”时才切换。五个环境的实测结果（同一份探测脚本，全部真实运行）：

| 信号 | 源码运行 | Nuitka standalone | Nuitka onefile | PyInstaller onedir | PyInstaller onefile |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `"__compiled__" in globals()` | `False` | **`True`** | **`True`** | `False` | `False` |
| `sys.frozen` | 无 | **无（Nuitka 不设置）** | 无 | `True` | `True` |
| `sys._MEIPASS` | 无 | 无 | 无 | `_internal` 目录 | 临时解压目录 |

::: warning PyInstaller 迁移者最大的坑
网上广为流传的 `getattr(sys, "frozen", False)` 检测**对 Nuitka 完全失效**——Nuitka 刻意不设置 `sys.frozen` 和 `sys._MEIPASS`，因为它们是 PyInstaller 的私有约定而非 Python 标准。从 PyInstaller 迁移到 Nuitka 时，代码里所有基于这两个信号的检测分支都必须改写。
:::

Nuitka 的标准检测写法：

```python title="检测是否被 Nuitka 编译"
def is_compiled() -> bool:
    return "__compiled__" in globals()
```

为什么是 `in globals()`？因为 `__compiled__` 是**每个被编译模块**的模块级全局变量（不是内置对象）：主模块有、你代码里被编译的 `helpers.py` 也有；只有运行时动态加载、未被编译的 `.py` 文件里才是 `False`。前文 `app_dir()` 里的 `try: __compiled__ ... except NameError` 写法与此完全等价。

除了判断“是不是编译产物”，`__compiled__` 对象还携带模式信息（实测属性值）：

| 属性 | standalone 下 | onefile 下 | 用途 |
| :-- | :-- | :-- | :-- |
| `.standalone` | `True` | `True` | 是否独立分发模式（onefile 也属于 standalone） |
| `.onefile` | `False` | `True` | 判断 onefile 模式 |
| `.main` | `'__main__'` | `'__main__'` | 当前模块是不是主模块 |
| `.module` | `False` | `False` | 是否 `--mode=module` 编译 |
| `.containing_dir` | dist 外层目录 | exe 所在目录 | 路径定位，见[前文](#程序里怎么定位文件-最容易踩的坑) |
| `.original_argv0` | 启动路径 | 启动路径 | 拿原始启动命令 |

组合起来的实用写法：

```python title="环境与模式判断模板"
import sys

IS_COMPILED = "__compiled__" in globals()
# 短路求值：源码运行时不会触碰 __compiled__
IS_ONEFILE = IS_COMPILED and __compiled__.onefile  # noqa: F821
IS_STANDALONE = IS_COMPILED and __compiled__.standalone  # noqa: F821

# 需要同时兼容 PyInstaller / Nuitka 的库代码用这个
IS_FROZEN_ANY = IS_COMPILED or getattr(sys, "frozen", False)

if IS_ONEFILE:
    print("onefile 模式：内置资源在临时目录，重文件放 exe 旁边")
```

### 交付给其他用户

| 交付形态 | 怎么做 | 收货方怎么用 |
| :-- | :-- | :-- |
| standalone 文件夹 | 把 `main.dist` 整个目录压缩发送 | 解压后双击里面的 `main.exe` / `main.bin` |
| onefile 单文件 | 直接发送那一个二进制，可附一份默认 `config.json` | 下载即用，会读同目录下的配置 |
| 安装包 | 加 `--windows-create-installer`（NSIS）/ `--macos-create-installer`（DMG）/ `--linux-create-installer`（AppImage） | 装完从开始菜单/启动台打开 |

注意事项：

- **平台与架构绑定**：macOS 上编译的只能给 macOS 用（实测产物明确标注了 `runs on macOS 15.0 (arm64) or higher`），Windows 同理。跨平台就三台机器各编译一次（可配合 GitHub Actions 的 macOS/Ubuntu/Windows 矩阵，官方提供 [Nuitka-Action](https://github.com/Nuitka/Nuitka-Action)）。
- **onefile 是自解压不是加密**：怕杀软误报可以改用 standalone + 安装包，并对可执行文件做代码签名（Windows）。
- 交付 standalone 时若安排了用户配置文件，目录布局给用户讲清楚即可，程序用 `app_dir()` 找同目录文件。

---

## Playwright 专项

用 Nuitka 打包 Playwright 程序要单独拎出来讲，因为 Playwright 是三件套结构：

1. **Python 包**（`playwright`）——Nuitka 正常编译；
2. **Node.js 驱动**（`driver/node` + `driver/package/cli.js`，约 100+ MB）——纯数据文件；
3. **浏览器二进制**（Chromium 等，每个 100~300 MB）——默认装在用户缓存目录，**不在** Python 包里。

### 驱动（driver）怎么带上

**什么都不用做。** Nuitka 自带 Playwright 支持配置（且在 standalone/onefile 模式下自动启用，无需 `--enable-plugins`），只要 import 了 playwright，`node` 可执行文件和整个 `driver/package` 会自动复制进 dist：

````text title="实测产物：pw.dist/ 内部（无关项省略）"
pw.dist/
├── pw.bin                        ← 运行入口
└── playwright/
    └── driver/
        ├── node                  ← 内置的 Node.js 运行时（Windows 为 node.exe）
        └── package/
            ├── cli.js            ← 驱动入口
            ├── browsers.json     ← 各浏览器版本清单
            └── lib/ ...
````

前提只有一条：**编译所用的 Python 环境里装了 `playwright`**（`pip install playwright`）。实测一个仅 import playwright 的程序，standalone 产物约 165 MB——体积主要就是 driver。

### 浏览器怎么带上：两种方案

#### 方案 A：浏览器内置（推荐，交付最简单）

```sh title="内置 Chromium 的完整流程"
# 1. 在编译用的环境里安装浏览器（只装 chromium，别装全家桶）
playwright install chromium

# 2. 查看浏览器目录名（后面要用）
playwright install chromium --dry-run
# 输出示例：
#   Install location: ~/Library/Caches/ms-playwright/chromium-1243
#   Install location: ~/Library/Caches/ms-playwright/chromium_headless_shell-1243
#   Install location: ~/Library/Caches/ms-playwright/ffmpeg-1011

# 3. 编译时指定要内置的浏览器
python -m nuitka --mode=standalone \
  --playwright-include-browser=chromium-1243 \
  --playwright-include-browser=chromium_headless_shell-1243 \
  --output-dir=build main.py
```

要点：

- **参数值是"目录名"不是浏览器名**，来自第 2 步的输出或直接 `ls` 缓存目录（Windows `%LOCALAPPDATA%\ms-playwright`，macOS `~/Library/Caches/ms-playwright`，Linux `~/.cache/ms-playwright`）。
- 只要指定任何 `chrom*` 开头的浏览器，插件会**自动附带 ffmpeg**，不用手写。
- `--playwright-include-browser=all` 一网打尽本机已装的浏览器，**图省事直接用它**（配合第 1 步只装 chromium，实际就是 chromium 全家桶）。
- 浏览器会被打进去放在 `dist/playwright/driver/package/.local-browsers/` 下，运行时 Playwright 优先从这里找，**目标机器什么都不用装**。

> [!important]
> **headless 模式还要 headless_shell**
>
> Playwright 1.49+ 的 `p.chromium.launch()` 默认是无头模式，用的是 `chromium_headless_shell-xxxx` 目录；只有 `headless=False` 才用完整的 `chromium-xxxx`。**两者都要带上**，否则在目标机器上会报 `Executable doesn't exist`。用 `all` 就不会漏。

#### 方案 B：浏览器外置（exe 旁边）

浏览器放程序旁边而不是塞进程序——便于按需更新浏览器、或避免 onefile 体积爆炸。编译时**不带** `--playwright-include-browser`，然后：

::: file-tree icon="colored" title="外置浏览器的交付布局"

- 交付给用户
  - myapp
    - main.bin **运行入口** # Windows: main.exe
    - ms-playwright # 从本机缓存目录整体拷来的浏览器
      - chromium-1243
      - chromium_headless_shell-1243
      - ffmpeg-1011
  :::

程序第一行（必须在启动浏览器前，建议 `import playwright` 之前）设置查找路径：

```python title="main.py（外置浏览器）"
import os
import sys
from pathlib import Path

# 与 exe 同级的 ms-playwright 目录
os.environ.setdefault(
    "PLAYWRIGHT_BROWSERS_PATH",
    str(Path(sys.argv[0]).resolve().parent / "ms-playwright"),
)

# 之后再 import / 启动
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    ...
```

> [!warning]
> 外置方案要求浏览器目录与编译用的 Playwright **版本匹配**（`browsers.json` 与包版本绑定）。最稳的做法：编译机上用同一个虚拟环境 `playwright install chromium`，再把缓存目录原样拷出去交付。

### Playwright 打包检查清单

- [x] 编译环境 `pip install playwright` 且是**最终程序使用的版本**
- [x] 用 `--mode=standalone` 先验证；Playwright 程序**不建议 onefile**（driver + 浏览器解压数百 MB 到临时目录，启动极慢），单文件需求建议改用方案 B 或安装包
- [x] 内置时记得 `chromium_headless_shell-xxxx`（或直接 `all`）
- [x] Linux 目标机缺系统库：让用户执行一次 `playwright install-deps` 对应的依赖安装，或查 Playwright 文档按发行版装齐 `libnss3` 等库
- [x] 报 `playwright is not installed`？说明编译环境里没装 playwright，装好重编

---

## 常见问题排障

| 症状 | 处理 |
| :-- | :-- |
| 运行报 `ModuleNotFoundError: xxx` | 动态导入没被分析到：`--include-module=xxx`（单模块）或 `--include-package=xxx`（整包） |
| 某包的图片/模板/配置缺失 | `--include-package-data=包名`，可用 `:*.png` 限定模式；还不行提交 issue |
| 某个第三方包打出来就崩 | 用 `--report=compilation-report.xml` 看它的处理记录，缺 DLL 用 YAML 包配置补（见下） |
| Windows GUI 程序一闪退、无报错 | 临时加 `--force-stderr-spec={PROGRAM_BASE}.err.txt` 把 traceback 落到文件再排查 |
| 编译太慢 | 装 ccache；`--jobs` 拉满；参数不变时第二次起只编译改动过的模块 |
| onefile 每次启动都被防火墙/杀软重新询问 | 解包目录每次都变导致，加 `--onefile-tempdir-spec={CACHE_DIR}/{PRODUCT}/{VERSION}` |
| 想给某个包手工补 DLL/隐式导入 | 写 `my.nuitka-package.config.yml`，用 `--user-package-configuration-file=my.nuitka-package.config.yml` 传入 |

YAML 包配置最小示例（补数据目录和动态 DLL，格式与 Nuitka 内置配置一致）：

```yaml title="my.nuitka-package.config.yml"
- module-name: "mypkg.some_module"
  data-files:
    dirs:
      - "assets"
  dlls:
    - from_filenames:
        relative_path: "bin"
        prefixes:
          - "libmydep*"
      when: "win32"
```

> [!tip]
> 遇到包的兼容性问题，优先去 [Nuitka 仓库](https://github.com/Nuitka/Nuitka/issues)搜一圈——大部分坑（PySide6、numpy、torch、playwright…）内置配置已经处理，升级 Nuitka 往往比重配参数管用。

---

## 参考

<LinkCard title="Nuitka 官方用户手册" icon="vscode-icons:file-type-html" href="https://nuitka.net/user-documentation/user-manual.html" description="参数全集、项目注释语法、数据文件、Tweaks（图标/安装器/版本信息）" />

<LinkCard title="Nuitka Use Cases（官方）" icon="vscode-icons:file-type-html" href="https://nuitka.net/user-documentation/use-cases.html" description="按场景组织的官方教程：加速、standalone、onefile、wheel、Multidist、CI" />

<LinkCard title="python的打包神器——Nuitka（博客园）" icon="vscode-icons:file-type-vue" href="https://www.cnblogs.com/cfld/p/16355904.html" description="广为流传的中文入门，参数基于 Nuitka 1.x，本文已按 4.x 校正" />

<LinkCard title="Playwright for Python" icon="vscode-icons:file-type-vue" href="https://playwright.dev/python/docs/library" description="Playwright 官方文档（含 PyInstaller 打包章节，思路与本文方案一致）" />
