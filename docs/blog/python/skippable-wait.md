---
title: 可跳过的等待：控制台脚本按键转人工与恢复执行
createTime: 2026/10/15 16:20:00
tags:
  - python
  - asyncio
  - 终端
permalink: /blog/06842poo/
---

自动化脚本最常见的死局：某一步要等一个"可能很久、也可能永远不来"的结果——网页跳转、第三方就绪、队列轮转。等吧，时间不可控；把超时调短吧，网络一慢就误判失败。理想的交互是**让用户随时按键接管**：自动等待立即中止，人手工处理，处理完再按一个键，脚本从断点继续。

这篇教程实现这套"**可跳过的等待 + 人工接管 + 恢复执行**"机制。为了照顾没有终端编程经验的读者，我们先从最简单的同步版本讲起，再进阶到 asyncio 版本，最后给出一份实测过的坑位清单。

[[TOC]]

## 阅读前的两个基础知识

第一次接触"读按键"的开发者，通常卡在两件事上：**终端默认不是按键即达的**，以及**按键到底以什么形式到达程序**。先建立这两个概念，后面的代码就好懂了。

### 终端默认是"行缓冲"的

在终端里敲字时，你看到的字符不会立刻送给程序——它们先存在终端的缓冲区里，直到你按下回车，程序才一次性收到**一整行**。这叫**规范模式**（canonical mode，也叫 cooked mode）。

所以 `input()` 永远只能"读完一整行"，做不到"按一个键立刻响应"。要读单键，必须先把终端切出规范模式：

| 平台          | 切法                                        | 效果                                 |
| :------------ | :------------------------------------------ | :----------------------------------- |
| Windows       | 无需切换，`msvcrt` 模块直接从控制台缓冲区读 | 按键即达、无回显                     |
| macOS / Linux | `tty.setcbreak()` 切到 cbreak 模式          | 按键即达、无回显，但保留 Ctrl-C 信号 |

::: warning 用 cbreak，不要用 raw
`tty.setraw()` 会同时关掉 `ISIG`——Ctrl-C 变成普通字节 `0x03`，**程序杀不掉了**。要保留 Ctrl-C 中断就用 `tty.setcbreak()`。
:::

### 按键到达程序时是什么：字符、键码与转义序列

程序读到的永远不是"按键"这个抽象概念，而是**字节**。不同终端把这些字节编码成几种不同的方案，了解它们你才能查询、验证和自定义按键：

1. **ASCII / C0 控制字符**：普通可打印字符（字母、数字）就是它们的编码值；控制键是一个字节：Esc 是 `0x1b`，回车是 `0x0d`，空格是 `0x20`，Ctrl-C 是 `0x03`（Ctrl 系列 = 字母值减 0x40，如 Ctrl-X 是 `0x18`）。
2. **转义序列（escape sequence）**：没有 ASCII 码位的键——方向键、F1–F12、Home/End——由**多个字节**表示，且几乎都以 `0x1b`（Esc）开头。例如在传统的 xterm 编码（俗称 **keycode / termcap 风格**）里：↑ 是 `\x1b[A`、↓ 是 `\x1b[B`、F1 是 `\x1bOP`。
3. **现代编码方案（Kitty keyboard protocol / CSI-u）**：新一代终端（Kitty、WezTerm、Ghostty 等）支持把每个按键编码成 `CSI unicode-key-code ; modifiers u` 形式的序列，例如 Ctrl-C 是 `\x1b[99;5u`。它解决了"Ctrl+C 和 Ctrl+键 撞码"的老问题，但**默认不开启**——程序要主动发启用序列终端才会切换。本文只读传统编码，不涉及 CSI-u。

::: tip 如何查询和验证一个按键的字节
你还可以参照[菜鸟教程的ASCII表](https://www.runoob.com/w3cnote/ascii.html)，比如 `Esc` 十六进制是 `1B` ，那么就是 `0x1b`

- macOS / Linux：在真实终端里执行 `showkey -a`（或 `cat -v`，敲键后回车），会直接打印每个键的字节序列，例如按 ↑ 输出 `^[ [ A`（即 `\x1b[A`）。
- 也可查终端数据库：`infocmp -1 xterm | grep kup` 能看到 ↑ 键的定义。
- Windows：`getwch()` 返回值本身就是键码；方向键、功能键先返回 `'\x00'` 或 `'\xe0'` 前缀，第二次调用返回扩展键码。
- 一切以**实测输出为准**——同一颗 F1 键，不同终端/模式下的字节可能不同，这正是下文代码里"Esc 需要判定窗口"的原因。
:::

本文统一使用 **Esc 键**做"跳过"信号：它语义上就是"中止/退出"，Windows 上 `getwch` 对它返回单个 `'\x1b'` 无歧义；Unix 上虽然与转义序列共享首字节，但可以用 50ms 判定窗口区分（见后文坑位清单）。

## 版本一：同步（非 asyncio）实现

不是所有脚本都用 asyncio。同步版结构更简单，核心思路是：**在业务循环里轮询键盘**，一旦发现 Esc 就跳出自动等待，进入人工处理，回车后继续。

```python title="sync_demo.py"
import sys
import time


def wait_or_skip(check, description: str, poll: float = 0.5, max_wait: float = 120.0):
    """轮询 check() 直到为 True；期间按 Esc 立即中止并抛 UserSkipError。"""
    reader = KeyReader()          # 下文实现的跨平台单键读取器
    with reader.listening():
        deadline = time.monotonic() + max_wait
        while time.monotonic() < deadline:
            if check():
                return            # 自动等待成功
            if reader.pressed_escape():
                raise UserSkipError(description)
            time.sleep(poll)
    raise TimeoutError(description)


def manual_fallback(reason: str, verify) -> bool:
    """人工接管：提示 → 等回车 → 校验状态。"""
    input(f"{reason}，请手动完成操作后按回车继续：")
    if verify():
        return True
    print("未达预期状态，执行兜底逻辑……")
    return False


class UserSkipError(RuntimeError):
    """用户按键主动跳过自动等待。"""


if __name__ == "__main__":
    started = time.monotonic()
    try:
        # 业务条件：60 秒后"就绪"。等不及就按 Esc。
        wait_or_skip(
            check=lambda: time.monotonic() - started > 60,
            description="等待资源就绪（按 Esc 转人工）",
        )
        print("自动等待完成")
    except UserSkipError as e:
        print(f"已跳过：{e}")
        manual_fallback("人工处理", verify=lambda: True)
    print("脚本继续执行后续步骤……")
```

同步版的要点：

- 用**专用异常** `UserSkipError` 而不是布尔返回值——它天然穿透多层调用栈，上层统一 `except UserSkipError` 转人工，不需要每层函数都改签名。
- 跳过之后的代码路径要**校验业务状态是否已达成**，达不成就做兜底（自动导航、重试），而不是直接报错退出。这样"自动失败 → 人工补位 → 继续执行"才闭环。
- 用 `with reader.listening():` 保证任何路径退出都恢复终端状态（Unix 上尤其关键）。

## 版本二：asyncio 实现——等待与取消信号竞速

轮询适合同步脚本，但 asyncio 下更优雅的做法是**竞速（race）**：把"业务等待"和"按键信号"两个任务交给 `asyncio.wait(FIRST_COMPLETED)`，谁先完成听谁的。按键胜出时取消业务任务，抛出 `UserSkipError`，捕获后走进"人工处理 + 确认 + 校验"分支，出来继续原流程。

```python title="skip_or_wait.py"
import asyncio
from collections.abc import Awaitable, Callable


class UserSkipError(RuntimeError):
    """用户按键主动跳过自动等待。"""


async def skip_or_wait[T](
    factory: Callable[[], Awaitable[T]],
    description: str,
    *,
    skip: asyncio.Event,
) -> T:
    """等待 factory() 完成；期间 skip 置位则取消等待并抛 UserSkipError。"""

    async def run() -> T:
        # 延迟创建：保证可取消、无未 await 警告
        task: asyncio.Future[T] = asyncio.ensure_future(factory())
        skip_task = asyncio.create_task(skip.wait())
        try:
            await asyncio.wait(
                {task, skip_task}, return_when=asyncio.FIRST_COMPLETED
            )
            if task.done() and not task.cancelled():
                return task.result()  # 正常完成或业务自身异常，原样透传
            raise UserSkipError(description)
        finally:
            skip_task.cancel()
            if not task.done():
                task.cancel()

    return await run()
```

调用方：

```python title="usage.py"
skip = asyncio.Event()

async def do_step():
    try:
        await skip_or_wait(
            lambda: page.wait_for_url("https://example.com/home", timeout=120_000),
            "等待登录后跳转（按 Esc 转人工）",
            skip=skip,
        )
    except UserSkipError:
        log.info("用户按键跳过，转人工处理")
        await manual_fallback()   # 人工接管：提示操作 → 等回车 → 校验状态 → 兜底
    # 没有异常就继续自动流程
```

业务等待自身的超时/异常会从 `task.result()` 原样抛出，与跳过互不干扰。

## 读取单键：两个平台两种做法

竞速的另一半是"按键把 `skip` 置位"，也就是本文开头说的"切终端模式读单键"。

:::: tabs#platform

@tab:active Windows

Windows 不需要切终端模式：`msvcrt` 模块的 `kbhit()`/`getwch()` 直接从控制台输入缓冲区无回显读键，轮询即可。cmd、Windows PowerShell 5.1、PowerShell 7 行为完全一致——`getwch` 读的是**进程附加的控制台**，与哪个 shell 启动它无关。

```python title="keys_windows.py"
import asyncio
import msvcrt

ESCAPE = "\x1b"

async def watch_escape(on_skip) -> None:
    while True:
        while msvcrt.kbhit():
            key = msvcrt.getwch()
            if key in ("\x00", "\xe0"):
                # 方向/功能键是两字节：先返回 \x00 或 \xe0 前缀
                # 必须再读一次配对键码，否则残留字节会被误读
                if msvcrt.kbhit():
                    msvcrt.getwch()
                continue
            if key == "\x03":
                # getwch 把 Ctrl-C 当普通字节返回，不会产生信号
                # 不手动补发，用户在等待期间就失去了中断能力
                raise KeyboardInterrupt
            if key == ESCAPE:
                on_skip()
                return
        await asyncio.sleep(0.05)
```

@tab macOS / Linux

Unix 没有 `msvcrt`，需要 `termios` 把终端切到 **cbreak 模式**（单键直达、关闭回显，但保留 Ctrl-C 信号），再用事件循环的 `add_reader` 监听 stdin：

```python title="keys_posix.py"
import asyncio
import os
import sys
import termios
import tty

ESCAPE = "\x1b"
GRACE = 0.05  # Esc 与转义序列的判定窗口（秒）


class EscapeWatcher:
    def __init__(self, loop: asyncio.AbstractEventLoop, on_skip) -> None:
        self.loop = loop
        self.on_skip = on_skip
        self.fd = sys.stdin.fileno()
        self.saved = termios.tcgetattr(self.fd)  # 先快照，退出时恢复
        self.buffer = b""
        self.timer: asyncio.TimerHandle | None = None

    def start(self) -> None:
        tty.setcbreak(self.fd)  # 不要用 setraw：会把 Ctrl-C 也变成普通字节
        self.loop.add_reader(self.fd, self._on_readable)

    def stop(self) -> None:
        if self.timer is not None:
            self.timer.cancel()
            self.timer = None
        self.loop.remove_reader(self.fd)
        termios.tcsetattr(self.fd, termios.TCSADRAIN, self.saved)
        # 清掉已敲未读的残余按键，否则会被后面的 input() 读走
        termios.tcflush(self.fd, termios.TCIFLUSH)

    def _on_readable(self) -> None:
        chunk = os.read(self.fd, 32)
        if not chunk:  # stdin 关闭
            self.stop()
            return
        if self.timer is not None:
            self.buffer += chunk  # 判定窗口内到达：属于转义序列
            return
        if not chunk.startswith(b"\x1b"):
            return  # 普通按键：吞掉
        self.buffer = chunk
        if len(chunk) == 1:
            # 单独 \x1b 可能是 Esc，也可能是方向键序列的第一个字节
            # 等 50ms，没有后续字节才算独立按键
            self.timer = self.loop.call_later(GRACE, self._settle)
        else:
            self.buffer = b""  # 一次读全了，是完整转义序列

    def _settle(self) -> None:
        self.timer = None
        if self.buffer == b"\x1b":
            self.stop()
            self.on_skip()
        else:
            self.buffer = b""
```

::::

## 把监听封装成随进随退的上下文

监听只在等待期间开启，退出必须恢复终端。用异步上下文管理器收口，并处理"非交互终端"的退化：

```python title="watch.py"
import asyncio
import sys
from contextlib import asynccontextmanager, suppress

if sys.platform == "win32":
    from keys_windows import watch_escape as _watch_windows
else:
    from keys_posix import EscapeWatcher


@asynccontextmanager
async def watch_escape(on_skip):
    # 管道、CI、IDE 输出面板里 stdin 不是 tty，直接禁用监听
    if not sys.stdin.isatty():
        yield False
        return
    if sys.platform == "win32":
        task = asyncio.create_task(_watch_windows(on_skip))
        try:
            yield True
        finally:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task
        return
    watcher = EscapeWatcher(asyncio.get_running_loop(), on_skip)
    watcher.start()
    try:
        yield True
    finally:
        watcher.stop()
```

组合进竞速骨架。`watch_escape` 传给 `yield` 的值就是 `async with ... as` 的目标：`True` 表示监听已激活，`False` 表示非 tty 已退化——后者根本没有按键可等，直接普通等待：

```python title="flow.py"
async def skip_or_wait(factory, description, *, timeout=None):
    skip = asyncio.Event()

    async def run():
        async with watch_escape(skip.set) as listening:
            if not listening:  # 非 tty：退化为普通等待
                return await factory()
            return await _race(factory(), skip, description)

    return await asyncio.wait_for(run(), timeout)
```

## 人工接管与恢复执行

跳过之后是这套机制的另一半——**恢复**。标准三段式：

```python title="manual.py"
async def manual_fallback(page, reason: str) -> None:
    # 1. 明确告诉用户发生了什么、要做什么
    await asyncio.to_thread(
        input, f"{reason}，请在窗口中手动完成操作，处理后按回车继续："
    )
    # 2. 校验业务状态是否已达成
    if await is_target_state(page):
        return
    # 3. 未达成则兜底，而不是报错退出
    log.warning("未达预期状态，自动导航后继续")
    await page.goto(HOME_URL)
```

::: tip 为什么"继续执行"用回车而不是又一个单键
人工操作期间双手可能不在键盘上，回车是终端里最不含糊的确认键；且此时已退出单键监听，`input()` 的行编辑、退格、粘贴都正常工作。一个键负责"中止自动"，另一个键负责"确认恢复"，职责分离。
:::

## 可复现的完整演示脚本

上面是分模块讲解，这里给一份**单文件、零依赖、可直接运行**的 asyncio 演示脚本。业务等待用 `asyncio.sleep(60)` 模拟"可能很久的结果"，让你在没有真实业务的情况下完整体验"Esc 转人工 → 回车恢复"的闭环。

```python title="demo.py"
"""可跳过的等待演示：python demo.py

- 按 Esc：跳过自动等待，进入人工接管提示
- 按回车：确认人工处理完成，脚本从断点继续
"""
import asyncio
import sys
import time

if sys.platform == "win32":
    import msvcrt

    ESCAPE = "\x1b"

    class KeyWatcher:
        """Windows：msvcrt 轮询版。"""

        def __init__(self, on_skip):
            self.on_skip = on_skip
            self.task = None

        async def __aenter__(self):
            self.task = asyncio.create_task(self._poll())
            return self

        async def __aexit__(self, *exc):
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass

        async def _poll(self):
            while True:
                while msvcrt.kbhit():
                    key = msvcrt.getwch()
                    if key in ("\x00", "\xe0"):
                        if msvcrt.kbhit():
                            msvcrt.getwch()  # 消费扩展键码
                        continue
                    if key == "\x03":
                        raise KeyboardInterrupt
                    if key == ESCAPE:
                        self.on_skip()
                        return
                await asyncio.sleep(0.05)
else:
    import os
    import termios
    import tty

    GRACE = 0.05  # Esc 与转义序列的判定窗口（秒）

    class KeyWatcher:
        """Unix：termios cbreak + add_reader 版。"""

        def __init__(self, on_skip):
            self.on_skip = on_skip
            # 取 stdin 的底层文件描述符（整数 fd，POSIX 下 stdin 恒为 0）：
            # termios / os.read / add_reader 是底层 API，只认 fd，不认 sys.stdin 流对象
            self.fd = sys.stdin.fileno()
            # 快照当前终端属性，退出监听时据此恢复（cbreak 会修改终端模式）；
            # 注意：非 tty（管道/CI）下裸调会抛 termios.error，见文末坑位清单
            self.saved = termios.tcgetattr(self.fd)
            self.buffer = b""
            # Esc 判定窗口定时器；非 None 表示正处于"等待后续字节"的窗口期
            self.timer = None
            self.loop = None

        async def __aenter__(self):
            # 协程内取运行中事件循环的标准 API；get_event_loop() 依赖弃用中的
            # 线程级"当前循环"状态，行为随版本变化，勿用
            self.loop = asyncio.get_running_loop()
            if sys.stdin.isatty():
                tty.setcbreak(self.fd)
                # 注册 stdin 可读回调：按键字节一到，事件循环立即调用 _on_readable
                self.loop.add_reader(self.fd, self._on_readable)
            return self

        # 退出监听（任何路径，含异常）：取消未触发的定时器、注销 stdin 监听、
        # 恢复终端模式并清空残余按键，保证终端回到可用状态
        async def __aexit__(self, *exc):
            if not sys.stdin.isatty():
                return
            if self.timer is not None:
                self.timer.cancel()
            self.loop.remove_reader(self.fd)
            # 恢复进入 cbreak 前快照的终端属性（回到行缓冲 + 回显），
            # 否则退出后终端无回显、行编辑失效；TCSADRAIN = 先排空输出再生效
            termios.tcsetattr(self.fd, termios.TCSADRAIN, self.saved)
            # 清空输入队列中"已敲未读"的按键字节，防止被后续 input() 误读
            termios.tcflush(self.fd, termios.TCIFLUSH)

        def _on_readable(self):
            chunk = os.read(self.fd, 32)
            if not chunk:
                return
            if self.timer is not None:
                self.buffer += chunk
                return
            # \x1b 是 Esc 的字节值；方向键等功能键的转义序列（如 \x1b[A）同样以它开头
            if not chunk.startswith(b"\x1b"):
                return
            self.buffer = chunk
            # 只读到 1 个字节 → 裸 Esc；多个字节 → 一次读全的转义序列（方向键等）
            if len(chunk) == 1:
                # 裸 \x1b 也可能是转义序列的首字节：延迟 GRACE 秒观察有无后续字节，
                # 到期由 _settle 裁决是否独立 Esc 键
                self.timer = self.loop.call_later(GRACE, self._settle)
            else:
                self.buffer = b""

        # 判定窗口到期的裁决：缓冲区里仍只剩 \x1b → 独立 Esc 键，触发跳过；
        # 否则窗口期内拼到了后续字节 → 是转义序列，清空放弃
        def _settle(self):
            self.timer = None
            if self.buffer == b"\x1b":
                self.on_skip()
            self.buffer = b""


class UserSkipError(RuntimeError):
    """用户按键主动跳过自动等待。"""


async def skip_or_wait(coro, description: str):
    skip = asyncio.Event()
    async with KeyWatcher(skip.set):
        task = asyncio.ensure_future(coro)
        skip_task = asyncio.create_task(skip.wait())
        try:
            await asyncio.wait({task, skip_task},
                               return_when=asyncio.FIRST_COMPLETED)
            if task.done() and not task.cancelled():
                return task.result()
            raise UserSkipError(description)
        finally:
            skip_task.cancel()
            if not task.done():
                task.cancel()


async def main():
    print("开始自动等待（最长 60 秒），按 Esc 转人工……")
    try:
        await skip_or_wait(asyncio.sleep(60), "等待资源就绪")
        print("自动等待完成")
    except UserSkipError:
        print("已跳过自动等待，转人工。")
        await asyncio.to_thread(
            input, "请手动完成操作后按回车继续："
        )
        print("人工处理确认，从断点继续。")
    print("脚本继续执行后续步骤……")


if __name__ == "__main__":
    asyncio.run(main())
```

运行方式与预期效果：

```sh
python demo.py
# 输出"开始自动等待……"后按 Esc → 立即打印"已跳过自动等待，转人工。"
# 手动做点事，按回车 → 打印"从断点继续"并走完后续流程
# 什么都不按 → 60 秒后正常完成
```

## 换用第三方库：prompt_toolkit 与 Textual

前文手写的终端层——cbreak 切换与恢复、转义序列判定、双平台分支——都是成熟轮子。能接受第三方依赖的话，有两个定位不同的选择，均为 MIT 协议、维护活跃（截至本文：prompt_toolkit 3.0.53，约 10.6k★；Textual 8.2.8，约 37.5k★。两者同源：prompt_toolkit 的作者 Jonathan Slenders 也是 Textual 的创造者）。零依赖是硬约束时，继续用前文手写版。

### prompt_toolkit：把"读单键"整个交出去

`pip install prompt_toolkit`。它是 ptpython、IPython 交互壳的底层库，输入层逐项对应我们手写的部分：

| 手写版（前文）                                        | prompt_toolkit                                        |
| :---------------------------------------------------- | :--------------------------------------------------- |
| `tcgetattr` 快照 + `setcbreak` + `tcsetattr` 恢复     | `with inp.raw_mode():`，一个上下文管理器包办         |
| `loop.add_reader(fd, ...)`                            | `with inp.attach(cb):`，内部同样注册事件循环监听     |
| 手写 `\x1b` 判定窗口与转义序列拼接                    | 内建 VT100 解析器，产出 `Keys.Escape`、`Keys.Up` 等  |
| `keys_windows.py` + `keys_posix.py` 两套实现          | `create_input()` 按平台自动选择，代码合一            |

demo.py 换用后，`watch.py` 加两份平台实现收敛成一份 20 行的 `watch_escape`：

```python title="demo_pt.py"
"""可跳过的等待（prompt_toolkit 版）：python demo_pt.py

- 按 Esc：跳过自动等待，进入人工接管提示
- 按回车：确认人工处理完成，脚本从断点继续
"""
import asyncio
import sys
from contextlib import asynccontextmanager

from prompt_toolkit.input import create_input
from prompt_toolkit.keys import Keys

GRACE = 0.05  # Esc 与转义序列的判定窗口（秒）


class UserSkipError(RuntimeError):
    """用户按键主动跳过自动等待。"""


@asynccontextmanager
async def watch_escape(on_skip):
    # 管道/CI 里 stdin 不是 tty，直接禁用监听
    if not sys.stdin.isatty():
        yield False
        return

    loop = asyncio.get_running_loop()
    inp = create_input()  # 按平台自动选择 Vt100 / Win32 实现，跨平台代码合一
    flush_handle = None

    def handle(keys):
        for kp in keys:
            if kp.key == Keys.Escape:  # 独立 Esc 已由解析器判定
                on_skip()
            elif kp.key == Keys.ControlC:
                # raw_mode 清掉了 ISIG，Ctrl-C 不再产生信号，手动补发
                raise KeyboardInterrupt

    def on_readable():
        nonlocal flush_handle
        handle(inp.read_keys())  # 读字节 + 解析转义序列，得到结构化按键
        if flush_handle is not None:
            flush_handle.cancel()
        # 与 Application 相同的窗口模式：窗口内无后续字节才算独立 Esc
        flush_handle = loop.call_later(GRACE, lambda: handle(inp.flush_keys()))

    with inp.raw_mode(), inp.attach(on_readable):
        try:
            yield True
        finally:
            if flush_handle is not None:
                flush_handle.cancel()


async def skip_or_wait(coro, description: str):
    skip = asyncio.Event()
    # yield 值 = 监听是否真的启动：False（非 tty）时不可能有按键到达，
    # 不进竞速，直接普通等待
    async with watch_escape(skip.set) as listening:
        if not listening:
            return await coro
        task = asyncio.ensure_future(coro)
        skip_task = asyncio.create_task(skip.wait())
        try:
            await asyncio.wait({task, skip_task},
                               return_when=asyncio.FIRST_COMPLETED)
            if task.done() and not task.cancelled():
                return task.result()
            raise UserSkipError(description)
        finally:
            skip_task.cancel()
            if not task.done():
                task.cancel()


async def main():
    print("开始自动等待（最长 60 秒），按 Esc 转人工……")
    try:
        await skip_or_wait(asyncio.sleep(60), "等待资源就绪")
        print("自动等待完成")
    except UserSkipError:
        print("已跳过自动等待，转人工。")
        await asyncio.to_thread(
            input, "请手动完成操作后按回车继续："
        )
        print("人工处理确认，从断点继续。")
    print("脚本继续执行后续步骤……")


if __name__ == "__main__":
    asyncio.run(main())
```

与 demo.py 的差异只剩两处：`watch_escape` 的实现（收益所在），以及 `skip_or_wait` 用 `as listening` 消费了它的 yield 值——非 tty 时直接 `return await coro`，退化路径从 demo.py 的"内部静默"变成显式分支。上文 pty 用例对 demo_pt.py 全部实测通过——Esc 触发跳过、`\x1b[A` 不触发、Ctrl-C 中断、监听期 ECHO 关闭且退出后恢复、Esc → 回车闭环、stdin 接管道时正常退化为普通等待。但有三件事库**不**替你做，仍要自己处理：

:::: warning prompt_toolkit 仍需自己处理的三件事
1. **独立 Esc 的判定窗口要自己排**。`read_keys()` 只解析"本次读到的字节"，尾部孤立的 `\x1b` 会留在解析器里等后续字节——它可能是方向键序列的首字节。prompt_toolkit 自家的 Application 是在每次输入后起一个 0.5 秒定时器（`ttimeoutlen`）再 `flush_keys()` 冲出悬置按键；demo 里沿用前文的 50ms 窗口做同一件事。
2. **Ctrl-C 要自己补发**。`raw_mode()` 是完整 raw：源码里 `_patch_lflag` 清掉了 `ISIG`，`\x03` 以普通按键身份到达回调。不处理它，等待期间用户就失去了中断能力——在回调里把 `Keys.ControlC` 转成 `KeyboardInterrupt`。
3. **`isatty()` 守卫与残余按键照旧**。非 tty 的退化逻辑仍在 `watch_escape` 入口；Unix 下退出后想清掉"已敲未读"的按键，保留前文那行 `termios.tcflush` 即可。
::::

### Textual：当"人工接管"值得一块屏幕

`pip install textual`。Textual 不是"简化按键监听"，而是把整个流程装进 TUI：按键绑定、任务取消、退出时恢复终端，全部由框架管理，`termios`/`msvcrt` 一行都不用写。代价是应用接管整块屏幕（备用屏幕、鼠标模式），形态从"往普通输出里穿插提示的脚本"变成"界面应用"——好在 `App.run()` 返回后，普通脚本流程照常继续。

```python title="demo_textual.py"
"""可跳过的等待（Textual 版）：python demo_textual.py

- 自动等待期间按 Esc：中止自动等待，转人工
- 手动处理完成后按回车：从断点继续，随后退出应用
"""
import asyncio

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.widgets import Footer, Header, Static


class SkippableWaitApp(App[None]):
    TITLE = "可跳过的等待"
    CSS = "#status { padding: 1 2; }"
    BINDINGS = [Binding("escape", "skip", "转人工（跳过自动等待）")]

    def __init__(self, wait: float = 60.0) -> None:
        super().__init__()
        self.wait = wait
        self.skipped = False
        self.worker = None

    def compose(self) -> ComposeResult:
        yield Header()
        yield Static(f"自动等待中（最长 {self.wait:.0f} 秒）……", id="status")
        yield Footer()

    def on_mount(self) -> None:
        self.worker = self.run_worker(self.auto_wait, exclusive=True)

    def status(self, text: str) -> None:
        self.query_one("#status", Static).update(text)

    async def auto_wait(self) -> None:
        await asyncio.sleep(self.wait)  # 业务等待：网页跳转、轮询……
        self.status("自动等待完成")
        await asyncio.sleep(1.0)  # 展示片刻再退出
        self.exit()

    def action_skip(self) -> None:
        self.worker.cancel()  # 取消正在运行的业务等待
        self.skipped = True
        self.status("已转人工：请在目标窗口手动完成操作，处理后按回车继续")

    def on_key(self, event) -> None:
        if self.skipped and event.key == "enter":
            self.status("人工确认完成，从断点继续……")
            self.set_timer(0.5, self.exit)


if __name__ == "__main__":
    SkippableWaitApp().run()
    print("脚本继续执行后续步骤……")
```

要点：

- **声明式绑定**：`BINDINGS` 把 `escape` 映射到 `action_skip`，Footer 自动展示快捷键提示；Esc 与转义序列的歧义、平台差异都在框架内部解决。
- **可取消的业务等待**：`run_worker()` 把业务等待交给框架的任务管理，`worker.cancel()` 就是前文"竞速 + 取消"的全部。
- **恢复即退出**：人工确认后 `self.exit()`，终端恢复由框架负责——这正是坑位清单里"退出路径完整性"问题的框架化答案。
- **测试不再需要 pty**：`async with app.run_test() as pilot:` 里 `await pilot.press("escape")` 即可 headless 驱动按键，跨平台；本文的转人工、恢复、自然完成三条路径均以此实测。

选型一句话：往现有脚本里嵌一个"按 Esc 转人工"，选 prompt_toolkit；交互本身要长成界面（多步人工接管、实时日志），选 Textual。

## 坑位清单

以下是实际实现中会逐一撞上的坑，按"一定会遇到"到"环境相关"排序。

::: warning 终端模式恢复必须在 finally 里
cbreak 模式下如果异常退出没恢复，用户会面对一个**无回显、行编辑失效**的"坏终端"。Unix 上的急救命令是 `stty sane`。预防只有一条：`tcgetattr` 快照放进入时，`tcsetattr` 恢复放 `finally`，任何路径都不例外。
:::

:::: details Windows：getch 家族的三个暗礁

1. **两字节键**：方向键、F1–F12 先返回 `'\x00'` 或 `'\xe0'` 前缀，第二次调用才返回键码。不配对消费，残留键码会被下轮轮询当成独立按键。
2. **Ctrl-C 失效**：`getwch` 期间 Ctrl-C 不产生信号而是返回 `'\x03'`。必须手动 `raise KeyboardInterrupt`，否则等待期间用户无法中断程序。
3. **QuickEdit 选择模式**：conhost 里用鼠标选中一段文本，控制台会**暂停所有输入输出**直到取消选择。表现为"程序卡死"，与代码无关。程序侧无法根治，知道即可。

::::

:::: details Unix：Esc 的转义序列歧义

Esc 键发送 `\x1b`，而方向键发送 `\x1b[A`、F1 发送 `\x1bOP`——首字节相同。读到 `\x1b` 后**等一个短窗口（约 50ms）**：没有后续字节才算独立 Esc。代价：50ms 内紧跟其他按键的 Esc 会被误判为序列吞掉（连按才会触发，正常单击无碍）。Windows 的 `getwch` 直接读控制台键码，**没有这个问题**。
::::

:::: details stdin 只能有一个读者

- 单键监听期间调用 `input()`：cbreak 下行编辑、回显全是坏的，读到的还是半行字节。
- 反过来，行输入期间的按键会被 `input()` 吃掉，监听收不到。
- 解决：**互斥**。行输入提示激活时停用单键监听（一个 `prompting` 标志位即可），同一时刻只允许一个组件拥有 stdin。
- 另一个相关坑：`asyncio.to_thread(input, ...)` 的线程**无法被取消**——取消任务后线程仍阻塞在 `readline` 上，下次 `input()` 会与它竞争。设计上避免"可取消的行输入"，让回车确认天然不可中断。

::::

::: warning asyncio.wait 只接受 Task/Future
`asyncio.wait({coro1(), coro2()})` 直接传协程在 Python 3.11+ 已移除，必须先 `create_task`。被取消的任务若以异常结束且从未 `await`，还会触发 "Task exception was never retrieved" 警告——竞速输掉的一方取消后 `await` 一次并吞掉 `CancelledError` 最稳妥。
:::

::: warning 手写上下文管理器：**aenter** 别漏 async
把监听封装成类（而不是用 `@asynccontextmanager`）时，`__aenter__`/`__aexit__` 必须写成 `async def`。漏掉 `async` 会在 `async with` 处抛出 `TypeError: 'async with' received an object from __aenter__ that does not implement __await__`，且紧跟一条极具误导性的 `RuntimeWarning: coroutine 'sleep' was never awaited`——警告指向作为参数传入的协程，病根却在上下文管理器：异常发生在 `ensure_future(coro)` 之前，调用点创建的协程对象自然无人接手。几十行代码里漏一个关键字，肉眼极难发现；定位时看 TypeError 的行号（`async with` 那一行），别被 RuntimeWarning 带偏。
:::

:::: details 非交互环境与打包

- **stdin 非 tty**：管道（`python app.py < data`）、CI、部分 IDE 的运行面板里 `isatty()` 为 `False`。不守卫就崩溃或永远收不到键，**必须退化成普通等待**。
  上文 demo.py 为保持单文件简单，`__init__` 里裸调了 `tcgetattr`，非 tty 下会直接抛 `termios.error`；正式代码请按 watch.py 的结构先 `isatty()` 再构造 watcher（或退一层，在 `skip_or_wait` 入口对非 tty 直接 `return await coro`）。
- **GUI 子系统打包**：PyInstaller `--windowed` / Nuitka `--windows-disable-console` 产物没有控制台，一切终端 API 无从谈起。需要本功能就保持 console 子系统。
- **Windows Terminal / ConPTY**：转译输入但保留 legacy 键码语义（Esc 仍是 `0x1b`，方向键仍是前缀+码），行为与 conhost 一致，无需适配。
- **WSL / mintty**：走的是 Linux 路径，`termios` 有效，但 mintty 默认未开启转义序列直通时部分功能键可能读不全。

::::

::: warning 多任务并发时的按键归属
如果多个协程同时处于"可跳过等待"，一个全局按键监听就语义不明了：按 Esc 是跳过谁？两个方案：**串行化**可跳过等待（同一时刻只有一个监听者），或维护"当前激活等待"注册表把按键路由给它。前者简单，够用就别上后者。
:::

## 测试：用伪终端注入按键

单键监听没法在普通单测里触发（pytest 的 stdin 不是 tty），macOS/Linux 上用 `pty` 造一个：父进程持有 master 端往里写字节，子进程的 stdin/stdout 挂在 slave 端，就是一个真终端。

```python title="test_pty.py"
import os, pty, select, subprocess, time


def run_in_pty(args, feed: bytes | None, budget: float) -> bytes:
    master, slave = pty.openpty()
    proc = subprocess.Popen(args, stdin=slave, stdout=slave, stderr=slave)
    os.close(slave)
    out, fed, deadline = b"", False, time.monotonic() + budget
    while time.monotonic() < deadline and proc.poll() is None:
        if select.select([master], [], [], 0.2)[0]:
            try:
                out += os.read(master, 4096)
            except OSError:
                break
        if not fed and feed is not None and b"READY" in out:
            time.sleep(0.3)          # 等监听就绪
            os.write(master, feed)   # 注入按键
            fed = True
    if proc.poll() is None:
        proc.kill()
    return out


# 断言要点：注入 b"\x1b" 后输出出现 SKIP_OK（且耗时远小于业务超时）
# 再注入 b"\x1b[A"（方向键）断言不触发；不注入则正常完成
```

至少覆盖四个用例：**Esc 触发跳过**、**方向键序列不触发**、**普通按键被吞且正常完成**、**非 tty（stdin 接管道）正常完成**。Windows 没有好用的 pty 等价物，老老实实在 cmd、PowerShell 5.1、PowerShell 7 各手动按一遍验收——这三个环境对 `msvcrt` 的行为是文档保证一致的。

## 小结

| 环节     | Windows                                              | macOS / Linux                        |
| :------- | :--------------------------------------------------- | :----------------------------------- |
| 单键读取 | `msvcrt.kbhit/getwch` 轮询                           | `termios` cbreak + `loop.add_reader` |
| Esc 键值 | `'\x1b'` 单字节，无歧义                              | 与转义序列共首字节，50ms 窗口判定    |
| Ctrl-C   | `getwch` 返回 `'\x03'`，手动补发 `KeyboardInterrupt` | cbreak 保留 `ISIG`，信号照常         |
| 终端恢复 | 无需切换，自然恢复                                   | `tcsetattr` + `tcflush` 放 `finally` |
| 非 tty   | `isatty()` 守卫，退化为普通等待                      | 同左                                 |

机制本身只有一句话：**竞速（或轮询）+ 取消 + 专用异常 + 恢复分支**。真正的工作量在终端细节和退出路径的完整性上——把上面清单里的坑逐条对过，这套交互在任何控制台程序里都是可复用的。
