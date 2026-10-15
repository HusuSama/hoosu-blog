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

| 平台 | 切法 | 效果 |
| :-- | :-- | :-- |
| Windows | 无需切换，`msvcrt` 模块直接从控制台缓冲区读 | 按键即达、无回显 |
| macOS / Linux | `tty.setcbreak()` 切到 cbreak 模式 | 按键即达、无回显，但保留 Ctrl-C 信号 |

::: warning 用 cbreak，不要用 raw
`tty.setraw()` 会同时关掉 `ISIG`——Ctrl-C 变成普通字节 `0x03`，**程序杀不掉了**。要保留 Ctrl-C 中断就用 `tty.setcbreak()`。
:::

### 按键到达程序时是什么：字符、键码与转义序列

程序读到的永远不是"按键"这个抽象概念，而是**字节**。不同终端把这些字节编码成几种不同的方案，了解它们你才能查询、验证和自定义按键：

1. **ASCII / C0 控制字符**：普通可打印字符（字母、数字）就是它们的编码值；控制键是一个字节：Esc 是 `0x1b`，回车是 `0x0d`，空格是 `0x20`，Ctrl-C 是 `0x03`（Ctrl 系列 = 字母值减 0x40，如 Ctrl-X 是 `0x18`）。
2. **转义序列（escape sequence）**：没有 ASCII 码位的键——方向键、F1–F12、Home/End——由**多个字节**表示，且几乎都以 `0x1b`（Esc）开头。例如在传统的 xterm 编码（俗称 **keycode / termcap 风格**）里：↑ 是 `\x1b[A`、↓ 是 `\x1b[B`、F1 是 `\x1bOP`。
3. **现代编码方案（Kitty keyboard protocol / CSI-u）**：新一代终端（Kitty、WezTerm、Ghostty 等）支持把每个按键编码成 `CSI unicode-key-code ; modifiers u` 形式的序列，例如 Ctrl-C 是 `\x1b[99;5u`。它解决了"Ctrl+C 和 Ctrl+键 撞码"的老问题，但**默认不开启**——程序要主动发启用序列终端才会切换。本文只读传统编码，不涉及 CSI-u。

::: tip 如何查询和验证一个按键的字节
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

组合进竞速骨架：

```python title="flow.py"
async def skip_or_wait(factory, description, *, timeout=None):
    skip = asyncio.Event()

    async def run():
        async with watch_escape(skip.set):
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

    GRACE = 0.05

    class KeyWatcher:
        """Unix：termios cbreak + add_reader 版。"""

        def __init__(self, on_skip):
            self.on_skip = on_skip
            self.fd = sys.stdin.fileno()
            self.saved = termios.tcgetattr(self.fd)
            self.buffer = b""
            self.timer = None
            self.loop = None

        async def __aenter__(self):
            self.loop = asyncio.get_running_loop()
            if sys.stdin.isatty():
                tty.setcbreak(self.fd)
                self.loop.add_reader(self.fd, self._on_readable)
            return self

        async def __aexit__(self, *exc):
            if not sys.stdin.isatty():
                return
            if self.timer is not None:
                self.timer.cancel()
            self.loop.remove_reader(self.fd)
            termios.tcsetattr(self.fd, termios.TCSADRAIN, self.saved)
            termios.tcflush(self.fd, termios.TCIFLUSH)

        def _on_readable(self):
            chunk = os.read(self.fd, 32)
            if not chunk:
                return
            if self.timer is not None:
                self.buffer += chunk
                return
            if not chunk.startswith(b"\x1b"):
                return
            self.buffer = chunk
            if len(chunk) == 1:
                self.timer = self.loop.call_later(GRACE, self._settle)
            else:
                self.buffer = b""

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

:::: details 非交互环境与打包

- **stdin 非 tty**：管道（`python app.py < data`）、CI、部分 IDE 的运行面板里 `isatty()` 为 `False`。不守卫就崩溃或永远收不到键，**必须退化成普通等待**。
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

| 环节 | Windows | macOS / Linux |
| :-- | :-- | :-- |
| 单键读取 | `msvcrt.kbhit/getwch` 轮询 | `termios` cbreak + `loop.add_reader` |
| Esc 键值 | `'\x1b'` 单字节，无歧义 | 与转义序列共首字节，50ms 窗口判定 |
| Ctrl-C | `getwch` 返回 `'\x03'`，手动补发 `KeyboardInterrupt` | cbreak 保留 `ISIG`，信号照常 |
| 终端恢复 | 无需切换，自然恢复 | `tcsetattr` + `tcflush` 放 `finally` |
| 非 tty | `isatty()` 守卫，退化为普通等待 | 同左 |

机制本身只有一句话：**竞速（或轮询）+ 取消 + 专用异常 + 恢复分支**。真正的工作量在终端细节和退出路径的完整性上——把上面清单里的坑逐条对过，这套交互在任何控制台程序里都是可复用的。
