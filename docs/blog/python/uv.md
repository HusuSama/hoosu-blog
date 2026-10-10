---
title: uv 使用指南：从入门到 Monorepo
createTime: 2026/10/10 10:16:00
permalink: /blog/iqkh544n/
tags:
  - python
  - uv
  - 包管理
---

[[TOC]]

## 它是什么

[uv](https://docs.astral.sh/uv/) 是 Astral 用 Rust 编写的 **Python 包管理器 + 项目管理器**。一个二进制文件，替代日常开发中的一整套工具：

| 传统工具 | uv 中的对应 |
| :-- | :-- |
| pip | `uv pip` |
| pip-tools（compile / sync） | `uv pip compile` / `uv pip sync`、`uv lock` |
| virtualenv | `uv venv` |
| pyenv | `uv python install` / `uv python pin` |
| pipx | `uv tool` / `uvx` |
| poetry / pipenv | `uv init` + `uv add` + `uv sync` |

它快（Rust 实现 + 全局缓存，同样依赖只装一次）、开箱即用（Python 版本、虚拟环境、锁文件全部内置）、并且对现有生态兼容度高（能读 `requirements.txt`、`pyproject.toml`）。

> [!NOTE]
> 本文以 uv 0.12.x 为基准（本机实测版本 0.12.15），所有命令均可直接照抄。

---

## 安装 uv

::: code-tabs

@tab:active macOS / Linux

```sh title="安装 uv（官方脚本）"
curl -LsSf https://astral.sh/uv/install.sh | sh
```

@tab Homebrew

```sh title="安装 uv（Homebrew）"
brew install uv
```

@tab pip

```sh title="安装 uv（pip）"
pip install uv
```

@tab Windows

```powershell title="安装 uv（PowerShell）"
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

:::

验证安装：

```sh title="终端"
uv --version
# uv 0.12.x
```

::: tip 两种安装方式的区别
官方脚本安装的 uv 可用 `uv self update` 一键自更新；pip 安装的 uv 需要再次执行 `pip install -U uv`。
:::

---

## 五分钟上手

::: steps

1. **创建项目**

   ```sh title="终端"
   uv init my-app
   cd my-app
   ```

   uv 0.12 默认生成 **src 布局**：代码在 `src/my_app/__init__.py`，同时生成 `pyproject.toml`（含运行入口 `my-app`）、`.python-version`、`README.md` 和 `.gitignore`。

2. **添加依赖**

   ```sh title="终端"
   uv add requests
   ```

   第一次执行 `uv add` 时，uv 会自动下载合适的 Python、创建 `.venv`、写入依赖并生成 `uv.lock`。

3. **写代码并运行**

   编辑入口文件 `src/my_app/__init__.py`：

   ```python title="src/my_app/__init__.py"
   import requests


   def main() -> None:
       r = requests.get("https://httpbin.org/json", timeout=10)
       print(r.json())
   ```

   直接运行项目入口点：

   ```sh title="终端"
   uv run my-app
   ```

4. **移除不需要的依赖**

   ```sh title="终端"
   uv remove requests
   ```

:::

::: tip 关键心智模型
uv 项目不需要手动创建、激活虚拟环境。`uv run` / `uv add` / `uv sync` 第一次执行时自动创建 `.venv`，之后所有 `uv run` 命令都在这个环境里运行。日常开发你只需要记住三个词：**add、run、sync**。
:::

---

## 常用命令速查

本节是 uv 命令的**独立速查表**，按使用频率从高到低分组。后续章节会展开讲每组命令的细节。

### 项目与依赖（最高频）

| 命令 | 作用 |
| :-- | :-- |
| `uv init [name]` | 初始化项目（`--lib` 库、`--package` 可发布包、`--bare` 最小骨架） |
| `uv add <pkg>` | 添加依赖并同步环境 |
| `uv add --dev <pkg>` | 添加开发依赖 |
| `uv remove <pkg>` | 移除依赖 |
| `uv sync` | 按 `uv.lock` 同步环境（缺锁时自动生成） |
| `uv lock` | 只重新解析并更新 `uv.lock` |
| `uv tree` | 查看依赖树 |
| `uv run <cmd>` | 在项目环境中运行命令 |
| `uv export` | 导出 `requirements.txt` 等格式 |

### 运行与 Python 版本（高频）

| 命令 | 作用 |
| :-- | :-- |
| `uv run my-app` | 运行项目入口点（由 `[project.scripts]` 定义） |
| `uv run --with <pkg> <cmd>` | 临时附加依赖运行 |
| `uv run --python 3.12 <cmd>` | 指定 Python 版本运行 |
| `uv python install 3.12` | 安装指定 Python 版本 |
| `uv python list` | 列出已安装的 Python |
| `uv python pin 3.12` | 写 `.python-version` 固定版本 |
| `uv python find 3.12` | 打印解释器路径 |
| `uv venv` | 创建虚拟环境（默认 `.venv`） |
| `uv venv --python 3.12` | 用指定 Python 创建虚拟环境 |

### 工具与 uvx（高频）

| 命令 | 作用 |
| :-- | :-- |
| `uvx <tool>` | 临时下载并运行工具（= `uv tool run`） |
| `uvx --from <pkg> <cmd>` | 包名与命令名不一致时指定包 |
| `uvx --with <pkg> <cmd>` | 运行时附加额外依赖 |
| `uv tool install <tool>` | 全局安装工具 |
| `uv tool list` | 列出已安装工具 |
| `uv tool update <tool>` | 更新指定工具 |
| `uv tool upgrade` | 更新全部工具 |
| `uv tool uninstall <tool>` | 卸载工具 |

### 构建、发布与维护（中频）

| 命令 | 作用 |
| :-- | :-- |
| `uv build` | 构建 wheel / sdist 分发包 |
| `uv publish` | 发布到 PyPI |
| `uv cache dir` | 查看缓存目录 |
| `uv cache clean` | 清空缓存 |
| `uv pip install <pkg>` | pip 兼容安装（需在虚拟环境中） |
| `uv pip list` | 列出环境中的包 |
| `uv self update` | 更新 uv 本身 |

---

## 项目与依赖管理

### 初始化项目的几种布局

```sh title="终端"
uv init app-demo           # 应用布局（默认）：src 布局 + 运行入口点
uv init --lib my-lib       # 库布局：src 布局 + py.typed，无入口点
uv init --package my-pkg   # 包布局：与 app 布局生成物相同，语义上是"可发布"
uv init --bare bare-demo   # 最小骨架：只有 pyproject.toml
```

::: tip 0.12 的变化
uv 0.12 中 `uv init`（app）与 `uv init --package` 生成的目录结构**完全相同**：都是 `src/<包名>/__init__.py` + `[project.scripts]` 入口点 + `uv_build` 构建后端，二者都直接支持 `uv build`。`--lib` 多一个 `py.typed` 且不生成入口点，适合 workspace 内部库。
:::

| 布局 | 生成物 | 适用场景 |
| :-- | :-- | :-- |
| app（默认） | src 布局 + 入口点 + build-system | Web 应用、脚本、CLI 工具 |
| lib | src 布局 + `py.typed` + build-system，无入口点 | workspace 内部库 |
| package | 与 app 相同 | 要发布到 PyPI 的库 |
| bare | 仅最小 `pyproject.toml` | workspace 根、从零手工搭建 |

### 添加依赖：uv add

```sh title="终端"
uv add requests                       # 普通依赖
uv add "requests>=2,<3"               # 版本约束
uv add "httpx[brotli]"                # 带 extras
uv add --dev pytest                   # 开发依赖
uv add --group docs mkdocs            # 依赖组（PEP 735）
uv add git+https://github.com/psf/requests.git   # Git 依赖
uv add ./libs/my-lib                  # 本地路径依赖
uv add --editable ./libs/my-lib       # 可编辑本地依赖（改源码即时生效）
uv add --no-sync flask                # 只改 pyproject.toml，不同步环境
```

执行 `uv add` 后，uv 会同时完成三件事：更新 `pyproject.toml` → 重新解析依赖并更新 `uv.lock` → 安装进 `.venv`。加 `--no-sync` 可以跳过最后一步。

### 移除依赖：uv remove

```sh title="终端"
uv remove requests              # 移除普通依赖
uv remove --dev pytest          # 移除开发依赖
uv remove --group docs mkdocs   # 从依赖组移除
```

### 同步环境：uv sync

`uv sync` 是"让环境回到 `uv.lock` 描述的状态"的命令，团队协作和 CI 的核心：

```sh title="终端"
uv sync                # 按 uv.lock 安装（锁不存在则先生成）
uv sync --frozen       # 严格按锁安装，锁过期直接报错（CI 首选）
uv sync --all-groups   # 连同所有依赖组一起安装
uv sync --no-dev       # 跳过开发依赖
```

> [!TIP]
> 拿到一个已有 `pyproject.toml` + `uv.lock` 的项目，直接 `uv sync` 就能复现完整环境，不需要任何其他步骤。

### 锁文件：uv lock

`uv.lock` 记录了解析后的精确版本和哈希，保证所有人装到一模一样的东西：

```sh title="终端"
uv lock           # 手动重新解析依赖并更新 uv.lock
uv lock --check   # 只检查锁是否最新，不做修改（CI 用）
```

### 查看依赖：uv tree

```sh title="终端"
uv tree             # 完整依赖树
uv tree --depth 2   # 只显示两层
uv tree --invert    # 反向查询：谁依赖了某个包
uv tree --outdated  # 标出有更新版本的包
```

### 导出标准格式：uv export

需要交付 `requirements.txt` 给不用 uv 的同事或部署平台时：

```sh title="终端"
uv export --format requirements-txt --output requirements.txt
uv export --no-dev --no-hashes --no-emit-project -o requirements-prod.txt
```

::: tip 默认会带一行 `-e .`
`uv export` 默认把项目自身也写进导出文件（`-e .` 可编辑安装）。如果接收方拿不到源码、只装依赖，务必加 `--no-emit-project` 排除项目本身。
:::

---

## 运行代码与脚本

### uv run：在项目环境里执行任何命令

```sh title="终端"
uv run my-app                  # 运行项目入口点（pyproject 的 [project.scripts]）
uv run python -c "from my_app import main; main()"   # 等价写法
uv run python script.py        # 运行任意脚本文件
uv run python -m pytest        # 运行项目里的模块
uv run pytest                  # 直接运行环境中的可执行程序
```

::: tip 0.12 的默认布局没有 main.py
`uv init` 生成的入口是 `src/my_app/__init__.py` 里的 `main()` 函数，通过 `pyproject.toml` 的 `[project.scripts]` 暴露为可执行命令。根目录没有 `main.py`，不要照搬 `python main.py` 的旧习惯。
:::

`uv run` 的行为：

- 项目存在但 `.venv` 不存在 → 自动创建并同步后运行；
- 项目存在且 `.venv` 存在 → 直接用现有环境运行（不会自动装新依赖，先 `uv sync`）；
- 不在任何项目里 → 用当前 Python 运行。

### 常用运行参数

```sh title="终端"
uv run --with requests python script.py    # 临时附加依赖（不写入 pyproject）
uv run --python 3.12 script.py             # 指定 Python 版本
uv run --env-file .env python app.py       # 加载 .env 环境变量
uv run --no-project python -c "print(1)"   # 脱离项目环境，用独立环境运行
uv run --isolated python -c "print(1)"     # 完全隔离，连全局缓存都不碰
```

::: tip --with 的典型场景
想快速试用一个库又不污染项目依赖：`uv run --with pandas python -c "import pandas; print(pandas.__version__)"`。
:::

---

## Python 版本管理

uv 内置了 pyenv 的能力，可以自动下载、管理多个 CPython 版本：

```sh title="终端"
uv python install 3.12        # 安装最新的 3.12.x
uv python install 3.12.10     # 安装精确版本
uv python list                # 查看已安装的所有 Python
uv python find 3.12           # 打印某个版本的解释器路径
uv python pin 3.12            # 把版本写入 .python-version
uv python dir                 # 查看 uv 的 Python 安装目录
uv python uninstall 3.12      # 卸载某个版本
```

两个机制值得了解：

1. **自动下载**：当项目 `.python-version` 指定的版本本地没有时，`uv sync` / `uv run` 会自动下载，无需手动安装。
2. **版本固定**：`uv python pin` 写出的 `.python-version` 会被提交进仓库，团队和 CI 自动使用同一版本。想完全禁止自动下载，可设置 `UV_PYTHON_DOWNLOADS=never`。

---

## 虚拟环境

```sh title="终端"
uv venv                  # 在 .venv 创建虚拟环境
uv venv env-custom       # 自定义目录名
uv venv --python 3.12    # 指定 Python 版本
uv venv --seed           # 预装 pip 和 setuptools（uv 默认不装）
```

::: tip uv 的虚拟环境默认没有 pip
`uv venv` 默认不安装 pip，这是刻意设计：uv 自己就是包管理器。需要 pip 时加 `--seed`。
:::

需要手动激活时（比如在 IDE 终端里直接 `python`）：

```sh title="终端"
source .venv/bin/activate    # macOS / Linux
.venv\Scripts\activate       # Windows
```

日常更推荐直接用 `uv run`，避免"忘了激活环境装错地方"的问题。

---

## uv pip：pip 兼容层

`uv pip` 是给**没有项目结构**的场景准备的 pip 平替（传统虚拟环境、Docker、临时环境），命令和 pip 基本一致但快得多：

```sh title="终端"
uv pip install requests            # 安装包
uv pip install -r requirements.txt # 从文件批量安装
uv pip list                        # 列出已安装的包
uv pip freeze                      # 导出当前环境
uv pip show requests               # 查看单个包信息
uv pip uninstall requests          # 卸载
uv pip check                       # 检查依赖冲突
```

::: warning 注意
`uv pip` 必须运行在**已激活的虚拟环境**中（或设置了 `VIRTUAL_ENV`）。它不会像 `uv add` 那样自动创建环境。在有 `pyproject.toml` 的项目里，请用 `uv add` / `uv sync` 而不是 `uv pip install`。
:::

### 锁定式部署：compile + sync

这是 pip-tools 工作流的 uv 版本，适合"精确复现环境"：

```sh title="终端"
uv pip compile requirements.in -o requirements.txt   # 从宽松依赖生成锁定文件
uv pip sync requirements.txt                          # 环境与锁定文件完全一致
```

---

## uvx 与全局工具

### uvx：临时运行任何 Python 工具

`uvx` 是 `uv tool run` 的别名，行为类似 `npx`：**不安装、直接跑**，用完留在缓存里，下次更快。

```sh title="终端"
uvx ruff check .                        # 代码检查
uvx black --check .                     # 代码格式化
uvx httpie https://httpbin.org/json     # 调试 HTTP 接口
uvx cowsay "hello uv"                   # 好玩但真实可用
```

常用参数：

```sh title="终端"
uvx --from <pkg> <cmd>          # 包名与命令名不一致时指定来源
uvx --with requests <cmd>       # 运行时附加依赖
uvx --python 3.12 black .       # 指定 Python 版本
uvx ruff@0.5.0 check .          # 固定工具版本（@ 语法）
uvx --isolated mypy .           # 完全隔离运行
```

::: tip uvx 与 npx / pipx 的对比
`uvx` 比 `npx` 快一个数量级，且自带缓存和版本锁定；比 `pipx` 更适合"一次性运行"，`pipx` 适合"长期安装"。uvx 的运行环境默认**完全隔离**，不会受当前项目影响。
:::

### uv tool：全局安装工具

需要长期、跨项目使用的命令行工具，用 `uv tool install`：

```sh title="终端"
uv tool install ruff                    # 全局安装
uv tool install --with pytest-cov pytest  # 安装时附带依赖
uv tool list                            # 查看已安装工具
uv tool update ruff                     # 更新指定工具
uv tool upgrade                         # 更新全部工具
uv tool uninstall ruff                  # 卸载
uv tool dir                             # 查看工具安装目录
```

---

## 进阶：Monorepo 工作区

uv 原生支持 workspace：**一个仓库管理多个 Python 包，共享同一个 `uv.lock` 和同一个 `.venv`**，成员之间互相引用不需要发布。

### 创建工作区

```sh title="终端"
uv init --bare my-workspace
cd my-workspace
uv init --lib packages/foo
uv init --lib packages/bar
```

::: tip 为什么根用 --bare
`uv init --bare` 只生成最小 `pyproject.toml`，不会多出一个 `src/my_workspace` 包。工作区根只需要承担"声明成员 + 统一锁文件"的职责，本身通常不需要代码。
:::

在根 `pyproject.toml` 声明成员：

```toml title="pyproject.toml"
[project]
name = "my-workspace"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = []

[tool.uv.workspace]
members = ["packages/*"]
```

最终结构：

::: file-tree icon="colored" title="工作区结构"

- my-workspace
  - pyproject.toml
  - uv.lock
  - packages
    - foo
      - pyproject.toml
      - src/foo/__init__.py
      - src/foo/py.typed
    - bar
      - pyproject.toml
      - src/bar/__init__.py
      - src/bar/py.typed
  :::

### 给指定成员操作

```sh title="终端"
uv add --package foo requests            # 只给 foo 加依赖
uv add --package bar --dev pytest        # 只给 bar 加开发依赖
uv run --package foo python -c "import foo"  # 在 foo 的环境里运行
uv lock                                   # 一次解析整个工作区
uv sync                                   # 一次同步整个工作区
```

### 成员之间互相依赖

让 `bar` 依赖 `foo`，只需要在 `bar` 的 `pyproject.toml` 里声明，`uv lock` 时自动解析为工作区成员：

```toml title="packages/bar/pyproject.toml"
[project]
name = "bar"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = ["foo"]
```

```sh title="终端"
uv lock && uv sync
```

> [!NOTE]
> 需要引用工作区外的包（如私有 Git 仓库）时，用 `[tool.uv.sources]` 显式声明来源，例如 `foo = { git = "https://github.com/your/foo.git" }`。

---

## 进阶：内联脚本依赖（PEP 723）

单文件脚本不想建项目、又需要第三方库时，把依赖写进脚本头部的注释里：

```python title="script.py"
# /// script
# requires-python = ">=3.12"
# dependencies = ["requests", "rich"]
# ///

import requests
from rich import print

r = requests.get("https://httpbin.org/json", timeout=10)
print(r.json())
```

直接运行：

```sh title="终端"
uv run script.py
```

uv 会自动解析脚本头部、创建**独立于项目的临时环境**并运行。管理脚本依赖：

```sh title="终端"
uv add --script script.py httpx      # 给脚本加依赖
uv remove --script script.py httpx   # 从脚本移除依赖
```

::: tip 适用场景
一次性数据清洗、自动化小工具、给同事分享的"开箱即跑"脚本。配合 `uv run --isolated` 可以做到完全不依赖当前环境。
:::

---

## 进阶：构建与发布

uv 0.12 的 `uv init` / `--lib` / `--package` 布局都自带 `[build-system]`（构建后端为 `uv_build`），直接就能构建：

```sh title="终端"
uv build                  # 构建 wheel + sdist 到 dist/
uv build --wheel --sdist  # 指定构建产物
uv publish                # 发布到 PyPI
uv publish --token $PYPI_TOKEN   # 显式传 token
```

::: warning 只有 --bare 布局例外
`uv init --bare` 生成的 `pyproject.toml` 没有 `[build-system]`，无法 `uv build`。需要发布时手动补齐构建后端（如 `uv_build`、`hatchling`）。
:::

::: warning 发布前置条件
`uv publish` 需要配置 PyPI token（环境变量 `UV_PUBLISH_TOKEN` 或 keyring）。发布前先 `uv build` 并用 `twine check dist/*` 之类的工具做本地校验。
:::

---

## 部署与交付

项目开发完成后，交付运行有三种主流方式，按推荐度排序：

| 方式 | 目标环境要求 | 适用场景 |
| :-- | :-- | :-- |
| 服务器装 uv | 能联网执行安装脚本 | 自建服务、长期运行、有运维能力 |
| Docker 镜像 | 服务器有 Docker | 标准化部署、平台统一交付 |
| wheel + requirements.txt | 只有 Python（含 pip） | 受限环境、无法安装 uv |

### 方式一：服务器安装 uv（推荐）

```sh title="服务器上执行"
curl -LsSf https://astral.sh/uv/install.sh | sh
git clone <你的仓库>
cd <项目>
uv sync --frozen --no-dev
uv run my-app
```

要点：

- `--frozen`：严格按 `uv.lock` 安装，锁与 `pyproject.toml` 不一致直接报错，保证线上环境与开发一致；
- `--no-dev`：跳过开发依赖（pytest、ruff 等）；
- 用 systemd / supervisor 托管时，`ExecStart` 直接写 `uv run my-app` 即可。

### 方式二：Docker 镜像

uv 官方提供预装 uv 和 Python 的镜像，配合分层缓存可以做到秒级构建：

```dockerfile title="Dockerfile"
FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# 第一层：只复制依赖声明，先装依赖（这层经常命中缓存）
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# 第二层：复制源码，安装项目本身
COPY . .
RUN uv sync --frozen --no-dev

CMD ["uv", "run", "my-app"]
```

镜像 tag 按项目 `.python-version` 选择，例如 `python3.12-bookworm-slim`、`python3.13-bookworm-slim`。

### 方式三：无 uv 环境（只有 Python）

服务器不允许安装 uv 时，交付 **wheel + requirements.txt** 两个产物，用标准 pip 安装：

**第一步：本地导出产物**

```sh title="本地执行"
uv export --no-dev --no-hashes --no-emit-project -o requirements.txt
uv build
```

- `--no-emit-project` 很重要：让 `requirements.txt` **只含第三方依赖**，不含项目本身（默认会带一行 `-e .`）；
- `uv build` 生成 `dist/my_app-0.1.0-py3-none-any.whl`。

**第二步：服务器部署**

```sh title="服务器上执行"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install dist/my_app-0.1.0-py3-none-any.whl
my-app
```

::: tip 为什么装完依赖还要装 wheel
`uv export` 只导出第三方**依赖**，项目自身的代码打包在 wheel 里。wheel 是标准格式，任何 Python 环境都能装，装上后入口点命令 `my-app` 才可用。
:::

### src 结构交付说明

`uv init`（0.12）生成的是 **src 布局**：代码在 `src/my_app/` 下，根目录**没有** `main.py`，运行入口由 `pyproject.toml` 的 `[project.scripts]` 定义：

```toml title="pyproject.toml（节选）"
[project.scripts]
my-app = "my_app:main"
```

因此在没有 uv 的环境里，有两个常见坑：

| 错误做法 | 现象 |
| :-- | :-- |
| `python main.py` | 文件不存在（根目录没有 main.py） |
| `python -c "import my_app"` | `ModuleNotFoundError`：包在 `src/` 下，不在 `sys.path` |

无 uv 时的三种正确运行姿势：

```sh title="终端"
# 1. 安装 wheel，用入口点运行（推荐，最接近生产）
pip install dist/my_app-0.1.0-py3-none-any.whl
my-app

# 2. 可编辑安装（开发期，改代码即时生效）
pip install -e .
my-app

# 3. 不安装，直接用 PYTHONPATH 指向 src
PYTHONPATH=src python -c "from my_app import main; main()"
```

::: warning --bare 布局交付注意
`uv init --bare` 生成的 `pyproject.toml` 没有 `[build-system]`，`pip install .` 会失败。需要交付运行的项目请使用默认布局（或 `--package`），它们自带构建后端。
:::

---

## 配置：镜像源与缓存

### 配置国内镜像源

国内网络环境推荐给 PyPI 配镜像，二选一：

**方式一：项目级**（推荐，跟随仓库走，团队共享）

```toml title="pyproject.toml"
[[tool.uv.index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
```

**方式二：环境变量**（对所有项目生效）

```sh title="终端"
export UV_DEFAULT_INDEX="https://pypi.tuna.tsinghua.edu.cn/simple"
```

### 全局配置文件

uv 的全局配置写在 `uv.toml`：

| 平台 | 路径 |
| :-- | :-- |
| macOS / Linux | `~/.config/uv/uv.toml` |
| Windows | `%APPDATA%\uv\uv.toml` |

```toml title="~/.config/uv/uv.toml"
cache-dir = "/Users/you/.cache/uv"
link-mode = "copy"
```

常用环境变量：`UV_DEFAULT_INDEX`（默认源）、`UV_CACHE_DIR`（缓存目录）、`UV_LINK_MODE`（copy / hardlink / symlink）、`UV_PYTHON_DOWNLOADS=never`（禁止自动下载 Python）。

### 缓存管理

```sh title="终端"
uv cache dir      # 查看缓存位置
uv cache clean    # 清空全部缓存
uv cache prune    # 只删除不再被引用的缓存
```

---

## 常见问题

::: details 已有 requirements.txt 的项目怎么迁移到 uv？

在项目目录执行：

```sh title="终端"
uv init                # 若还没有 pyproject.toml
uv add -r requirements.txt
uv lock && uv sync
```

`uv add -r` 会把文件里的依赖全部吸收为项目依赖。只想用 uv 装依赖、不建项目，用 `uv pip install -r requirements.txt`。

:::

::: details uv 能替代 conda 吗？

部分能。uv 管 Python 版本和 Python 包，但不负责 conda 提供的非 Python 系统库（如特定版本的 CUDA、MKL）。只写 Python 依赖时 uv 通常更快更简单。

:::

::: details .venv 要不要提交到 Git？

不要。`uv init` 生成的 `.gitignore` 已包含 `.venv`。同事拿到代码后 `uv sync` 即可复现环境。

:::

::: details CI 里怎么用 uv 保证可复现？

```sh title="CI 脚本"
uv sync --frozen   # 锁过期直接失败，绝不用"漂移"的依赖
uv run pytest
```

:::

::: details 如何升级 uv 本身？

官方脚本安装：`uv self update`。pip 安装：`pip install -U uv`。Homebrew：`brew upgrade uv`。

:::

::: details 项目里同时有 uv.lock 和 requirements.txt，以谁为准？

有 `pyproject.toml` 时以 `uv.lock` 为准；`requirements.txt` 只作为兼容性导出物，通过 `uv export` 生成，不要手工维护两份依赖清单。

:::

---

## 延伸阅读

- [uv 官方文档](https://docs.astral.sh/uv/)：所有命令的完整参考
- [uv 官方 Workspaces 指南](https://docs.astral.sh/uv/concepts/projects/workspaces/)：Monorepo 的详细说明
- [uv 官方 Tools 指南](https://docs.astral.sh/uv/guides/tools/)：uvx / uv tool 的进阶用法
