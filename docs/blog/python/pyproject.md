---
title: pyproject.toml 使用指南：规范详解与 uv / pdm 实战
createTime: 2026/10/16 15:00:00
tags:
  - python
  - pyproject
  - uv
  - pdm
permalink: /blog/inhy8hck/
---

[[TOC]]

## 它是什么

`pyproject.toml` 是 Python 项目的**唯一事实来源**（Single Source of Truth）：项目元数据、依赖声明、构建方式、工具配置全部收进这一个文件，替代过去的 `setup.py`、`setup.cfg`、`requirements.txt`、`.flake8` 等一堆散件。

它由一组 PEP 规范定义，每个顶级表对应一层职责：

| 顶级表 | 规范 | 职责 | 谁来读 |
| :-- | :-- | :-- | :-- |
| `[project]` | PEP 621 / 639 | 项目元数据：名称、版本、作者、依赖、入口点 | 所有构建后端、pip、uv、pdm |
| `[build-system]` | PEP 517 / 518 | 怎么把源码打成 wheel / sdist | pip、uv、pdm 等前端 |
| `[dependency-groups]` | PEP 735 | 开发用依赖组（dev、lint、docs…） | uv、pdm 等 PM 工具 |
| `[tool.<name>]` | PEP 518 约定 | 各工具私有配置（`[tool.uv]`、`[tool.pdm]`、`[tool.ruff]`…） | 对应工具 |

> [!NOTE]
> 本文规范部分以 PEP 621（元数据）、PEP 517/518（构建）、PEP 639（许可证）、PEP 735（依赖组）为准；工具部分基于 **uv 0.12.15** 与 **PDM 2.24.1** 实测（2026-10），所有 `pyproject.toml` 片段与命令均可直接照抄。uv 的安装与命令细节见 [uv 使用指南](/blog/iqkh544n/)。

---

## 一份完整模板

先看全貌，后面章节逐块展开：

```toml title="pyproject.toml — 覆盖本文全部知识点的模板"
# ============ 项目元数据（PEP 621）============
[project]
name = "my-app"                       # 必填，包名（PyPI 上的名字）
version = "0.1.0"                     # 必填（或声明为 dynamic）
description = "一个示例项目"
readme = "README.md"                  # 也可以是 { file = ..., content-type = ... }
requires-python = ">=3.12"            # 支持的 Python 版本范围
license = "MIT"                       # PEP 639：SPDX 许可证表达式
license-files = ["LICENSE"]           # PEP 639：随包分发的许可证文件
authors = [
  { name = "Alice", email = "alice@example.com" },
]
keywords = ["cli", "demo"]
classifiers = [
  "Programming Language :: Python :: 3",
  "License :: OSI Approved :: MIT License",
]
dependencies = [                      # 运行时依赖（PEP 508 格式）
  "httpx>=0.28",
  "rich>=13,<15",
  "platformdirs; sys_platform == 'win32'",   # 环境标记：仅 Windows 安装
]

[project.optional-dependencies]       # 可选功能组（extras）
server = ["fastapi>=0.115"]

[project.scripts]                     # 命令行入口点
my-app = "my_app.cli:main"

[project.entry-points."pytest11"]     # 插件入口点（以 pytest 插件为例)
my_plugin = "my_app.plugin"

# ============ 构建系统（PEP 517/518）============
[build-system]
requires = ["uv_build>=0.12.15,<0.13.0"]   # 构建时依赖（装进隔离环境）
build-backend = "uv_build"                 # 构建后端入口

# ============ 开发依赖组（PEP 735）============
[dependency-groups]
dev = ["pytest>=8", "ruff>=0.8"]
docs = ["mkdocs-material"]

# ============ 工具私有配置 ============
[tool.uv]
package = true                        # 视为可安装包（默认由 build-system 推断）

[tool.pdm]
distribution = true                   # pdm：项目可发布

[tool.pdm.scripts]                    # pdm：任务运行器（uv 没有对应物）
test = "pytest -q"
```

---

## [project]：项目元数据

### 必填与基本字段

| 字段 | 类型 | 必填 | 说明 |
| :-- | :-- | :-- | :-- |
| `name` | string | ✅ | 项目名。只允许字母、数字、`-`、`_`、`.`，且 `pip install` 时 `-` 与 `_` 等价（`my-app` 可 `import my_app` 由包目录决定，与项目名无关） |
| `version` | string | ✅* | PEP 440 版本号（如 `1.2.3`、`2.0.0rc1`）。与 `dynamic` 二选一，**必须显式给出其中之一** |
| `dynamic` | array | ✅* | 声明哪些字段由构建后端动态生成，如 `["version"]`（版本从 `__version__` 或 git tag 读取） |
| `description` | string | ❌ | 一句话简介，显示在 PyPI 页面标题下 |
| `readme` | string / table | ❌ | 长描述。字符串直接给文件名；表格形式可指定类型：`readme = { file = "README.md", content-type = "text/markdown" }` |
| `requires-python` | string | ❌ | PEP 440 版本范围。安装时解释器不满足直接拒绝，强烈建议必写 |

> [!TIP]
> `version` 与 `dynamic` 的关系：写了 `version = "0.1.0"` 就不能再出现在 `dynamic` 里；声明 `dynamic = ["version"]` 后需要给后端提供取值方式，例如 setuptools 用 `[tool.setuptools.dynamic]` `version = { attr = "my_app.__version__" }`，hatchling 用 `[tool.hatch.version]` `path = "src/my_app/__init__.py"`。

### license：新旧两种写法

PEP 639（2024）引入了更简洁的写法，旧写法已进入弃用流程，**新项目一律用新写法**：

| 写法 | 规范 | 示例 | 说明 |
| :-- | :-- | :-- | :-- |
| SPDX 表达式 | PEP 639 | `license = "MIT"`、`license = "MIT OR Apache-2.0"` | 值必须是合法 SPDX 许可证标识符（见 [spdx.org/licenses](https://spdx.org/licenses/)），非法值直接构建失败 |
| 许可证文件列表 | PEP 639 | `license-files = ["LICENSE", "NOTICE"]` | 支持 glob（如 `"LICEN[CS]E*"`），文件会被打进 wheel 的 `dist-info/licenses/` |
| 旧文本式 | PEP 621 | `license = { text = "MIT" }` | Metadata 2.1 风格，PDM 2.24 的 `pdm init` 仍生成此格式 |
| 旧文件式 | PEP 621 | `license = { file = "LICENSE" }` | 整个文件内容内嵌进元数据，同上已弃用 |

uv_build、hatchling、pdm-backend、setuptools（≥77）均支持新写法。

### 作者、关键词与分类器

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `authors` / `maintainers` | array of tables | 每项 `{ name = "...", email = "..." }`，`name` 与 `email` 至少其一 |
| `keywords` | array of strings | 搜索关键词 |
| `classifiers` | array of strings | Trove 分类器，**必须是[官方列表](https://pypi.org/classifiers/)中的原样字符串**，自编内容会被 PyPI 拒收。常用见下表 |
| `urls` | table | 任意键值链接：`Homepage = "..."`、`Repository = "..."`、`Documentation = "..."`、`Changelog = "..."` |

常用 classifiers 速查（完整列表以 pypi.org/classifiers 为准）：

| 类别 | 示例值 | 效果 |
| :-- | :-- | :-- |
| 开发阶段 | `Development Status :: 4 - Beta` | PyPI 侧栏显示成熟度，`1 - Planning` ~ `7 - Inactive` |
| 许可证 | `License :: OSI Approved :: MIT License` | 旧式许可证标记（用 PEP 639 `license` 时可省） |
| Python 版本 | `Programming Language :: Python :: 3.12` | 按版本筛选，写几个支持几个 |
| 环境 | `Operating System :: MacOS`、`OS Independent` | 平台过滤 |
| 框架 | `Framework :: FastAPI`、`Framework :: Pytest` | 生态聚合页 |

### dependencies：运行时依赖

数组中每一项是一条 **PEP 508** 依赖声明，语法拆解：

```text
"名称[extras]版本约束; 环境标记"
```

| 片段 | 示例 | 说明 |
| :-- | :-- | :-- |
| 名称 | `httpx` | 必填，规范化的 PyPI 包名 |
| extras | `httpx[brotli,http2]` | 安装该包的可选功能 |
| 版本约束 | `>=0.28`、`<15`、`==2.3.1`、`~=3.12` | 逗号分隔表示“与”。`~=3.12` 等价 `>=3.12, ==3.12.*`（允许补丁位变化）；`~=3.12.1` 等价 `>=3.12.1, ==3.12.*`（锁死前两位） |
| 任意版本 | `httpx` | 不写约束表示“任何版本”，由解析器（uv / pdm / pip）自由选择 |
| 环境标记 | `; python_version >= "3.12"`、`; sys_platform == 'darwin'`、`; extra == "server"` | 分号开头，条件成立才安装。多条件用 `and` / `or` 组合 |
| 直接 URL | `requests @ https://files.pythonhosted.org/...whl` | 锁定具体文件，锁文件常见，手写少用 |

> [!WARNING]
> `dependencies` 只放**运行必需**的包。pytest、ruff、mkdocs 这类开发工具放 `[dependency-groups]`；不是所有用户都需要的功能放 `[project.optional-dependencies]`。

### optional-dependencies：可选功能（extras）

表的每个键是一个 extras 名，值是依赖数组，安装时用 `包名[extras]`：

```toml title="pyproject.toml"
[project.optional-dependencies]
server = ["fastapi>=0.115", "uvicorn"]
crypto = ["cryptography>=43"]
all = ["my-app[server,crypto]"]   # extras 可以引用自身，聚合一组
```

```sh title="终端"
uv add --optional server fastapi     # uv：写入 server 组
uv sync --extra server               # uv：安装时启用
pdm add -G server fastapi            # pdm：-G 等价 --group，指向 optional 组
pip install "my-app[server,all]"     # 用户侧启用
```

| 对比项 | `dependencies` | `optional-dependencies` | `dependency-groups` |
| :-- | :-- | :-- | :-- |
| 谁会安装 | 所有用户 | 主动启用的用户 | 仅开发者（不随包发布） |
| 进 wheel 元数据 | ✅ | ✅ | ❌ |
| uv 安装命令 | 默认 | `uv sync --extra <name>` | `uv sync --group <name>`（`dev` 默认装） |
| pdm 安装命令 | 默认 | `pdm sync -G <name>` | `pdm sync -dG <name>` |

### 入口点：scripts 与 entry-points

**`[project.scripts]`** —— 声明命令行命令，key 是命令名，value 是 `导入路径:可调用对象`：

```toml title="pyproject.toml"
[project.scripts]
my-app = "my_app.cli:main"        # 安装后终端可执行 my-app
my-app-admin = "my_app.admin:Admin.run"   # 类方法也可以，注意不带括号
```

- 生效条件：**项目本身被安装**（editable 安装也算）。项目没安装时这个命令不存在——这是最常见的“配置写了却跑不起来”的坑，见 [何时必须写什么配置](#何时必须写什么配置)。
- `[project.gui-scripts]` 格式完全相同，Windows 上生成的快捷方式不弹控制台窗口，macOS / Linux 与 `scripts` 无区别。

**`[project.entry-points.<组名>]`** —— 插件注册机制，value 格式同上。组名由宿主框架约定：

```toml title="pyproject.toml"
[project.entry-points."pytest11"]        # pytest 约定组名，装上即被识别为插件
my_plugin = "my_app.pytest_plugin"

# ❌ 反例：[project.entry-points."jinja2.plugins"] —— 组名不能自造，必须查宿主框架文档
```

常见约定组名：`pytest11`（pytest 插件）、`babel.extractors`（babel 提取器）、`distutils.commands`（自定义构建命令）等，由宿主框架定义。**组名不能自造**，写错等于没写。

> [!TIP]
> 不要在 `[project.entry-points]` 下写 `console_scripts` 子表——那是 `scripts` 的内部实现，直接用 `[project.scripts]`。

---

## [build-system]：构建系统声明

```toml title="pyproject.toml"
[build-system]
requires = ["uv_build>=0.12.15,<0.13.0"]   # 构建时需要的包
build-backend = "uv_build"                 # 后端入口模块
backend-path = ["."]                       # （可选）本地后端搜索路径
```

### 三个参数逐个说

| 参数 | 类型 | 说明 |
| :-- | :-- | :-- |
| `requires` | array | **构建时**隔离环境里安装的依赖，不是项目运行依赖。前端（pip / uv / pdm）会先建临时 venv 装它们，再调用后端。一般只放后端本身（如 `hatchling`），后端额外需要构建工具（如 `cython`）时才追加 |
| `build-backend` | string | 后端入口，值是**固定枚举**（见下表）。前端导入该模块并调用其 `build_wheel` / `build_sdist` 钩子 |
| `backend-path` | array | 相对 `pyproject.toml` 的路径列表，用于仓库内自带的私有后端（如 `backend.py` 定义了钩子时写 `backend-path = ["."]`、`build-backend = "backend"`）。普通项目用不到 |

### build-backend 可选值（固定枚举）

| 值 | requires 写什么 | 适用场景 | 默认打包内容 |
| :-- | :-- | :-- | :-- |
| `uv_build` | `uv_build>=0.12,<0.13` | 纯 Python、src 布局。uv 自带、极快，`uv init` 默认 | `src/<包名>/`，须是 src 布局（可用 `[tool.uv.build-backend] module-name` 改名） |
| `hatchling.build` | `hatchling` | 纯 Python 通用选择，配置最灵活 | 自动发现包；多包/改名用 `[tool.hatch.build.targets.wheel] packages = ["src/foo"]` |
| `setuptools.build_meta` | `setuptools>=61` | 兼容老生态、C 扩展 | 自动发现；src 布局需 `[tool.setuptools.packages.find] where = ["src"]`。**≥61 才完整支持 PEP 621** |
| `flit_core.buildapi` | `flit_core` | 极简纯 Python 库，模块名须与项目名一致（`foo.py` 或 `foo/`） | 单模块 / 单包 |
| `pdm.backend` | `pdm-backend` | PDM 生态，`pdm init --dist` 默认 | 自动发现（含 src 布局）；自定义用 `[tool.pdm.build] includes = [...]` |
| `maturin` | `maturin>=1,<2` | **Rust** 扩展（PyO3 / PyO3-stubs），读取 `Cargo.toml` | Rust crate 对应的 Python 模块 |
| `scikit_build_core.build` | `scikit-build-core` | **C / C++**（CMake 工程） | CMake 定义的模块 |
| `mesonpy` | `meson-python` | C / C++ / Fortran / Cython（Meson 工程） | Meson 定义的模块 |

选择口径：纯 Python 且用 uv → `uv_build`；要发布给所有人、布局花样多 → `hatchling`；接手老项目 → `setuptools.build_meta`；带原生扩展 → 按语言选 `maturin` / `scikit_build_core.build` / `mesonpy`。

### 没有 [build-system] 会怎样

各前端对缺失的处理**不一样**，这是行为差异重灾区：

| 前端 | 行为 |
| :-- | :-- |
| pip | 按 PEP 517 兜底：视作 `requires = ["setuptools>=40.8.0"]` + `setuptools.build_meta:__legacy__`，走传统 setup.py 流程；setuptools 版本过老或项目缺 `setup.py` 时直接失败 |
| uv 0.12 | 项目视为 **virtual（不打包）**：`uv sync` 不安装项目自身（改代码即时生效靠 sys.path 注入）；`uv build` 仍会兜底用 uv_build 构建出一个**空壳包**（只有元数据没有代码），发布出去就是事故 |
| pdm | 视 `distribution = false`：`pdm install` 仍把项目以 editable 方式装进 `.venv`，但 `pdm build` 不可用 |

结论：**只要项目要 `uv build` / `pdm build` / 被别人 `pip install`，就必须显式写 `[build-system]`**，不要依赖任何兜底。

---

## [dependency-groups]：开发依赖组（PEP 735）

```toml title="pyproject.toml"
[dependency-groups]
dev = ["pytest>=8", "ruff>=0.8"]    # 保留组名：默认安装
lint = ["ruff>=0.8"]                # 自定义组：按需安装
docs = ["mkdocs-material>=9"]
```

| 特性 | 说明 |
| :-- | :-- |
| `dev` 组特殊 | 保留组名，`uv sync` / `pdm sync` 默认安装；其余组必须显式 `--group` |
| 不进发布包 | 依赖组只影响本地开发环境，不会写入 wheel 元数据（对比 extras 会） |
| uv 用法 | `uv add --group lint ruff` 写入；`uv sync --group lint` / `--all-groups` / `--no-dev` 安装 |
| pdm 用法 | `pdm add -dG lint ruff` 写入；`pdm sync -G lint` 安装；PDM 2.24 起 `pdm add -d` 默认写入此表 |
| 组间引用 | 一组可引用另一组，如 `all = ["-c dev", "-c lint"]`（uv、pdm 均支持 `{include-group = "dev"}` 标准写法） |

历史包袱（知道即可，新项目别用）：

```toml title="两种已被 PEP 735 取代的旧写法"
[tool.uv]
dev-dependencies = ["pytest>=8"]    # uv 0.4~0.5 的旧位置，已弃用，uv 会提示迁移

[tool.pdm.dev-dependencies]         # PDM <2.20 的旧位置，PDM 仍兼容读取
dev = ["pytest>=8"]
lint = ["ruff"]
```

---

## [tool.uv]：uv 专属配置

### 顶层常用项

| 键 | 类型 | 默认 | 说明 |
| :-- | :-- | :-- | :-- |
| `package` | bool | 由 `[build-system]` 推断 | 显式声明项目是否作为可安装包。`false` = virtual 项目：不装自身、`uv run` 直接跑源码 |
| `default-groups` | array | `["dev"]` | `uv sync` 默认安装哪些组；设 `[]` 则连 dev 都不装 |
| `managed` | bool | `true` | 项目是否由 uv 全权管理；`false` 用于把 uv 当 pip 用 |
| `required-version` | string | — | 锁定 uv 自身版本，如 `">=0.12,<0.13"`，CI 防漂移 |
| `environments` | array | 全平台 | 依赖解析范围，如 `["sys_platform == 'darwin' or sys_platform == 'linux'"]`，减少锁文件体积 |
| `constraint-dependencies` | array | — | 约束**下游依赖**版本而不直接依赖它，如 `["numpy>=2"]` |
| `override-dependencies` | array | — | 强制覆盖解析结果（处理上游声明错误时用，慎用） |
| `exclude-newer` | string | — | 只用该日期前发布的包，极端可复现场景 |

### [[tool.uv.index]]：包索引（镜像源）

```toml title="pyproject.toml"
[[tool.uv.index]]
name = "tuna"
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true                  # 替换默认 PyPI

[[tool.uv.index]]
name = "internal"
url = "https://pypi.corp.local/simple"
explicit = true                 # 只服务显式指定 name 的包
```

| 键 | 说明 |
| :-- | :-- |
| `url` | 索引地址，`default = true` 者为默认源 |
| `explicit` | 仅当依赖声明 `[tool.uv.sources]` 指向该 index 时才查它（私有源标准做法） |
| `name` | 供 `sources` 与 `--index` 引用 |

### [tool.uv.sources]：依赖来源覆写

```toml title="pyproject.toml"
[tool.uv.sources]
httpx = { git = "https://github.com/encode/httpx", rev = "0.28.1" }
my-lib = { path = "../my-lib", editable = true }    # 本地路径 + 可编辑
foo = { workspace = true }                          # workspace 成员
bar = { url = "https://example.com/bar-1.0.whl" }   # 直接 URL
internal-sdk = { index = "internal" }               # 强制走指定索引
```

规则：`sources` 只影响**本项目的解析**，不写入发布元数据；`dependencies` 里仍要写版本约束（如 `my-lib>=0.1`），`sources` 负责告诉 uv “这个约束从哪满足”。

### [tool.uv.workspace]：Monorepo 工作区

```toml title="根 pyproject.toml（uv init --bare 生成后再补全）"
[project]
name = "my-workspace"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = []

[tool.uv.workspace]
members = ["packages/*"]
exclude = ["packages/legacy"]
```

成员间互相引用：在被引用方保持正常 `[project]`，引用方写 `dependencies = ["foo"]` + `[tool.uv.sources] foo = { workspace = true }`。整个 workspace 共享一个 `uv.lock` 和 `.venv`。根项目用 `--bare` 就是为了不生成多余的 src 包。

---

## [tool.pdm]：PDM 专属配置

### 常用顶层项

| 键 | 类型 | 默认 | 说明 |
| :-- | :-- | :-- | :-- |
| `distribution` | bool | `false` | 项目是否作为可分发包。`true` 时 `pdm init` 自动补 `[build-system] pdm.backend`；`false` 项目仍以 editable 安装自身，但 `pdm build` 不可用 |
| `dev-dependencies.style` | string | `pep735`（2.24） | `legacy` 写回 `[tool.pdm.dev-dependencies]`，`pep735` 写 `[dependency-groups]`（当前默认），`pdm` 跟随现有文件 |

### [tool.pdm.scripts]：任务运行器（uv 没有的能力）

这是 uv 与 pdm 差异最大的地方：**PDM 内置任务运行器**，`[project.scripts]` 管的是“装给用户的命令”，`[tool.pdm.scripts]` 管的是“开发者自己的任务”：

```toml title="pyproject.toml"
[tool.pdm.scripts]
start = "python main.py"                        # 字符串 = cmd 任务
migrate = { cmd = "python manage.py migrate", env = { DJANGO_ENV = "prod" } }
shell-demo = { shell = "cat a.txt | grep ok" }  # 整串交给 shell，可用管道
run-py = { call = "my_app.tasks:cleanup(42)" }  # 调 Python 函数，可带参数
release = { composite = ["test", "build", "publish"] }   # 组合任务

test = { cmd = "pytest -q", help = "跑测试", working_dir = "src" }
pre_publish = "pdm check-clean"                 # 钩子：publish 前自动执行
_hide = "echo 不会出现在 pdm list"              # _ 前缀隐藏任务
```

| 任务类型 | 关键字 | 执行方式 |
| :-- | :-- | :-- |
| 命令 | `cmd`（或裸字符串） | 按空白拆分直接 exec，支持 `$VAR` 展开 |
| Shell | `shell` | 整条命令交给 `/bin/sh -c`，可用管道、通配符 |
| Python 调用 | `call` | 在项目环境里 `import` 并调用，支持传参 |
| 组合 | `composite` | 依次执行一组任务，支持 `parallel = true`、失败续跑 `keep_going = true` |

通用参数（任何任务类型可用）：`help`（`pdm list` 里显示的说明）、`env` / `env_file`（注入环境变量）、`working_dir`、`site_packages`（Python 调用时是否加载三方包）。

运行：`pdm run test`、`pdm run release`；`pdm list` 查看全部任务。

> [!WARNING]
> **uv 没有等价物。**`[tool.uv]` 下不存在任何任务脚本配置；uv 的官方答案是：入口命令用标准 `[project.scripts]` + `uv run`，复杂任务用外部工具（`just`、`taskfile`、`make`）。把 `[tool.pdm.scripts]` 抄进 uv 项目是**静默无效**的，uv 不认也不报错。

### [[tool.pdm.source]]：包索引

```toml title="pyproject.toml"
[[tool.pdm.source]]
name = "tuna"
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
verify_ssl = true

[[tool.pdm.source]]
name = "internal"
url = "https://pypi.corp.local/simple"
include_packages = ["internal-*"]   # 只有匹配的包走此源（可换成 exclude_packages）
```

与 uv 的差异：pdm 用 `include_packages` / `exclude_packages` 按包名路由到源，uv 用 `explicit` + `sources` 显式指认。

### [tool.pdm.build]：打包自定义

```toml title="pyproject.toml"
[tool.pdm.build]
includes = ["src/my_app", "templates/*.html"]   # 打进包的内容
excludes = ["**/*.pyc", "tests/"]
package-dir = "src"                             # 非 src 布局时不用写
```

---

## uv 与 pdm 配置差异总表

同一个意图，两个工具的落点：

| 意图 | uv | pdm |
| :-- | :-- | :-- |
| 命令行入口 | `[project.scripts]`（标准） | `[project.scripts]`（标准，两者一致） |
| 开发者任务 | ❌ 无内置，用 `[project.scripts]` + `uv run` 或 just/taskfile | ✅ `[tool.pdm.scripts]` + `pdm run` |
| dev 依赖 | `[dependency-groups]`（PEP 735） | 同左（2.24 默认）；旧项目可能见 `[tool.pdm.dev-dependencies]` |
| 项目是否打包 | 由 `[build-system]` 推断，可 `[tool.uv] package` 显式覆盖 | `[tool.pdm] distribution`，且 false 时仍 editable 安装自身 |
| 默认构建后端 | `uv_build`（`uv init` 写入） | `pdm.backend`（`pdm init --dist` 写入） |
| 镜像 / 私有源 | `[[tool.uv.index]]`（`default` / `explicit`） | `[[tool.pdm.source]]`（`include_packages` 路由） |
| 依赖来源覆写 | `[tool.uv.sources]`（git / path / url / workspace / index） | 无独立表，直接在 `dependencies` 写 PEP 508 URL / 路径 |
| 锁文件 | `uv.lock`，workspace 全仓一把锁 | `pdm.lock`，每项目一把 |
| Monorepo | `[tool.uv.workspace]` members + sources 原生支持 | 无原生 workspace，用相对路径依赖组合 |
| Python 版本声明 | `requires-python = ">=3.12"`（范围式）+ `.python-version` 单点 | `pdm init` 生成 `requires-python = "==3.14.*"`（锁定小版本段），范围式也支持 |
| 全局配置 | `uv.toml`（`~/.config/uv/uv.toml`） | `pdm config`（`~/.config/pdm/config.toml`） |

---

## 何时必须写什么配置

按“想执行什么 → 缺什么会失败”整理（均为实测行为，uv 0.12.15 / pdm 2.24.1）：

| 你想做的事 | 必须的配置 | 缺失时的表现 |
| :-- | :-- | :-- |
| `uv add` / `uv sync` 建环境 | `[project]` + `requires-python` | 能跑，但 Python 版本不受控 |
| `uv run my-app`（入口命令） | `[project.scripts]` **且** 项目被安装（有 `[build-system]` 或 `package = true`） | `error: Failed to spawn: my-app`——virtual 项目不装自身，入口不存在（实测复现） |
| `uv build` | `[project]` `name` + `version`；`[build-system]` | 0.12 会兜底 uv_build 构建出**空包**（无代码），发布即事故 |
| `uv publish` | 同上，且 PyPI 要求版本号未占用、`license` 新旧写法只能其一 | 上传被拒 |
| `pip install .`（给别人装） | `[build-system]`；后端要求 setuptools ≥ 61 | 走 legacy setup.py 兜底，无 `setup.py` 时直接失败 |
| `pdm build` | `[tool.pdm] distribution = true` + `[build-system]` | `distribution = false` 时不是可发布项目 |
| `pdm run <入口>` | `[project.scripts]`（pdm 始终 editable 安装自身，distribution 无关） | `pdm run` 找不到命令 |
| `pdm run <任务>` | `[tool.pdm.scripts]` 定义该任务 | 报错 command not found |
| pytest 插件被识别 | `[project.entry-points."pytest11"]` + 项目被安装 | pytest 无感知，插件不加载 |
| ruff / mypy 等读配置 | `[tool.ruff]`、`[tool.mypy]` 等（各自工具的表） | 工具用默认配置，不报错但行为非预期 |

---

## 常用流程：从零到发布

以 uv 为主线（pdm 命令对照给出），每步标注文件变化。

:::: steps

1. **初始化**

   ```sh title="终端"
   uv init --bare my-app && cd my-app   # 只要一个最小 pyproject.toml
   ```

   `--bare` 只生成 `[project]` 骨架（name / version / requires-python / 空 dependencies），**没有** README、入口、构建后端。要补的最小集（复制即用）：

   ```toml title="pyproject.toml — bare 之后的补全模板"
   [project]
   name = "my-app"
   version = "0.1.0"
   description = "一句话简介"
   readme = "README.md"                 # 手动建 README.md
   requires-python = ">=3.12"
   dependencies = []

   [project.scripts]                    # 要有命令才加
   my-app = "my_app.cli:main"

   [build-system]                       # 要可安装/可构建才加
   requires = ["uv_build>=0.12.15,<0.13.0"]
   build-backend = "uv_build"
   ```

   对照其他模式：`uv init`（app）与 `--package` 自动带 scripts + uv_build（src 布局）；`--lib` 同上但无入口、多 `py.typed`；`--no-package` 是不打包的 virtual 项目。
   pdm：`pdm init`（不可发布）/ `pdm init --dist`（带 `pdm.backend` + `distribution = true`）。

2. **加依赖**

   ```sh title="终端"
   uv add httpx                    # → [project].dependencies
   uv add --dev pytest             # → [dependency-groups].dev
   uv add --group lint ruff        # → [dependency-groups].lint
   uv add --optional server fastapi  # → [project.optional-dependencies].server
   ```

   pdm 对照：`pdm add httpx` / `pdm add -d pytest` / `pdm add -G lint ruff` / `pdm add -G server fastapi`（pdm 的 `-G` 同时用于 optional 组与依赖组，以现有键名为准）。

3. **声明入口与任务**

   手写 `[project.scripts]`（见上文格式）；uv 项目任务就交给 `uv run`；pdm 项目可加 `[tool.pdm.scripts]`。

4. **锁定与同步**

   ```sh title="终端"
   uv lock          # 生成 uv.lock（提交进 git）
   uv sync          # 同步 .venv：装依赖 + editable 安装项目自身
   ```

   pdm：`pdm lock` / `pdm sync`（锁文件 `pdm.lock`，同样提交）。

5. **构建与发布**

   ```sh title="终端"
   uv build                    # dist/my_app-0.1.0.tar.gz + .whl
   uv publish                  # 传 PyPI（--token 或环境变量认证）
   ```

   pdm：`pdm build` / `pdm publish`。前置检查：`[build-system]` 存在、`version` 唯一、license 新旧写法没有混用。

::::

---

## 常见坑

:::: details 装了包却 import 不到 / 命令不存在

项目是 virtual（无 `[build-system]` 且 `package` 未设 true），uv 不会把项目装进环境。要么补 `[build-system]`，要么显式 `[tool.uv] package = true`。

::::

:::: details uv build 成功但 wheel 里没有代码

无 `[build-system]` 时 uv 兜底 uv_build，对没有 `src/<name>/` 的项目构建出空壳包。检查 `dist/*.whl`（`unzip -l`）确认内容，别只看 build success。

::::

:::: details setuptools 报 "invalid pyproject.toml" 或元数据丢失

`requires` 里的 setuptools 版本 < 61，PEP 621 支持不完整。写 `requires = ["setuptools>=61"]`。

::::

:::: details license 构建失败：invalid SPDX expression

用了旧写法 `{ text = "..." }` 与新写法 `license = "..."` 混用，或 SPDX 表达式拼错（如 `"Apache 2.0"`，正确是 `"Apache-2.0"`）。查 [spdx.org/licenses](https://spdx.org/licenses/)。

::::

:::: details [tool.pdm.scripts] 在 uv 项目里不生效

uv 不读这张表，也不报错。等价方案：`[project.scripts]` + `uv run`，或引入 just / taskfile。

::::

:::: details dependency-groups 与 optional-dependencies 傻傻分不清

一句话：**groups 装给写代码的人（不发布），extras 装给用包的人（随元数据发布）**。测试框架放 groups，可选运行时功能放 extras。

::::

---

## 延伸阅读

- [PEP 621 — Storing project metadata in pyproject.toml](https://peps.python.org/pep-0621/)：`[project]` 全字段规范
- [PEP 517](https://peps.python.org/pep-0517/) / [PEP 518](https://peps.python.org/pep-0518/)：构建前端 / 后端协议与 `[build-system]`
- [PEP 639 — License expression](https://peps.python.org/pep-0639/) 与 [PEP 735 — Dependency Groups](https://peps.python.org/pep-0735/)
- [PEP 508](https://peps.python.org/pep-0508/)：依赖声明语法（版本约束与环境标记）
- [uv 官方 pyproject 指南](https://docs.astral.sh/uv/concepts/projects/config/)：`[tool.uv]` 全量参考
- [PDM 官方脚本文档](https://pdm-project.org/latest/usage/scripts/)：`[tool.pdm.scripts]` 全参数
- 站内：[uv 使用指南：从入门到 Monorepo](/blog/iqkh544n/)
