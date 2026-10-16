---
title: asyncio 使用指南：从入门到进阶
createTime: 2026/10/16 10:00:00
tags:
  - python
  - asyncio
  - 异步
  - 并发
permalink: /blog/vf0f5gOl/
---

这篇文档面向**有 Python 基础、但几乎没写过异步代码**的开发者：你会写函数、用类、懂装饰器，但看到 `async def`、`await`、事件循环这些词就发怵。全文以 **Python 3.14** 为基准编写（示例均在 3.14 上实测），更低版本不可用的 API 会标注最低版本（如「3.11+」），已废弃或行为变化的 API 会单独提示，每个 API 都配「代码 + 实际效果」说明。

[[TOC]]

## 开始之前：异步的限制与适用场景

先泼冷水，再教用法。asyncio 的本质是**单线程 + 事件循环 + 协作式调度**：所有协程跑在同一个线程里，事件循环负责在协程「主动让出」控制权时切换到另一个协程。这个模型决定了它的能力边界。

### 异步做不到的事

1. **不能加速 CPU 密集型任务**。同一时刻只有一个协程在真正执行，图像处理、加密计算、大规模数值运算放进异步里不会变快，反而多一层调度开销。
2. **一个阻塞调用会冻结整个事件循环**。协程切换只发生在 `await` 处；如果某段代码在两个 `await` 之间卡住（比如 `time.sleep(5)`），事件循环线程被占住，**所有**协程一起停摆——其他协程连「该超时了」都感知不到。

   ```python title="blocking_demo.py"
   import asyncio
   import time

   async def bad():
       time.sleep(1)        # 阻塞调用：整个事件循环停 1 秒

   async def good():
       await asyncio.sleep(1)  # 异步等待：让出控制权，其他协程继续跑

   async def main():
       start = time.perf_counter()
       await asyncio.gather(bad(), bad())    # 串行卡顿：≈ 2 秒
       print(f"bad 耗时 {time.perf_counter() - start:.1f}s")

       start = time.perf_counter()
       await asyncio.gather(good(), good())  # 真并发：≈ 1 秒
       print(f"good 耗时 {time.perf_counter() - start:.1f}s")

   asyncio.run(main())
   ```

3. **异步具有「传染性」**。一个函数用了 `await`，它的调用者就必须也是 `async`，一路传染到入口。没法在同步代码的某个深层函数里「局部异步一下」。
4. **必须使用异步生态的库**。`requests`、`open()`、同步数据库驱动（如 `psycopg2`）都是阻塞的，直接在协程里调用等于触发第 2 条。要用 `httpx`/`aiohttp`、`aiofiles`、`asyncpg` 这类异步库，或者用后文讲的 `to_thread` 兜底。

::: warning 阻塞调用是新手第一大坑
常见的「无意间阻塞」：`time.sleep()`、`requests.get()`、`open().read()` 大文件、`re` 处理超大文本、同步 DB 驱动、`input()`。它们不报错、不警告，只是让并发悄悄退化成串行。
:::

### 适合用异步的场景

| 场景 | 典型例子 | 为什么合适 |
| :--- | :--- | :--- |
| 大量网络 IO | 爬虫、批量调 API、微服务聚合 | 上千个连接「同时等响应」，单线程即可承载 |
| 长连接服务 | WebSocket 服务器、消息推送 | 天然按「事件到来」驱动，与事件循环模型吻合 |
| IO 并发 + 轻量处理 | 下载 + 简单解析 + 落盘 | 等待占比远高于计算占比 |
| 并发任务编排 | 同时抓 20 个源，谁超时谁重试 | `gather`/`TaskGroup`/超时控制是现成的 |
| 替代多线程脚本 | 原本开 50 个线程拉数据 | 协程切换成本远低于线程，且没有锁竞争的心智负担 |

### 不适合（或收益有限）的场景

| 场景 | 更好的选择 |
| :--- | :--- |
| CPU 密集（压缩、哈希、图像、数值计算） | `multiprocessing` / `ProcessPoolExecutor` |
| 只并发几个简单任务、想少改代码 | `ThreadPoolExecutor`，简单直接 |
| 本地文件为主的少量 IO | 线程池即可，异步收益不明显 |
| 依赖的库只有同步版且调用频繁 | 线程池，或考虑换库 |

一句话判断：**任务的大部分时间在「等外部响应」→ 用异步；大部分时间在「算」→ 用多进程。**

## 进程、线程、协程：先分清三兄弟

在深入 asyncio 之前，用一张表把三个并发模型摆正。它们解决的都是「同时做多件事」，区别在于**谁负责切换**、**切换多重**：

| 维度 | 多进程 | 多线程 | asyncio 协程 |
| :--- | :--- | :--- | :--- |
| 调度方 | 操作系统 | 操作系统 | 事件循环（用户态） |
| 切换时机 | 系统决定，随时可打断 | 系统决定，随时可打断 | 只在 `await` 处主动让出 |
| 切换成本 | 高（页表、文件描述符） | 中（内核上下文切换） | 极低（函数调用量级） |
| 内存开销 | 每进程独立解释器，MB 级 | 每线程约 MB 级栈 | 每协程 KB 级 |
| 数据共享 | 需 IPC（Queue/Pipe） | 共享内存，需加锁 | 单线程内共享，天然无抢占竞态 |
| 真并行 | 可以（多核） | 受 GIL 限制\* | 不行（单线程） |
| 适合 | CPU 密集 | 阻塞 IO、兼容同步库 | 海量并发 IO |

\* CPython 的 GIL（全局解释器锁）使多线程无法并行执行 Python 字节码。Python 3.14 的 **free-threaded 构建**（`python3.14t`，PEP 703/779）已正式支持去掉 GIL 运行，多线程可以真并行——但它是需要单独安装的独立构建，默认构建仍带 GIL。所以在默认环境下，**多线程仍主要用于 IO 等待**，CPU 并行交给多进程最稳妥。

对协程新手最关键的一条区别：线程可能在你任意两行代码之间被操作系统切走；而协程**只在 `await` 处切换**——两个 `await` 之间的代码天然是原子的。这大幅降低了写并发代码的心智负担，也是后文「为什么单线程还需要 Lock」的答案来源。

## 三个核心概念：协程、Task、事件循环

### 调用 async 函数 ≠ 执行它

```python title="coroutine_object.py"
import asyncio

async def hello():
    print("hello")

coro = hello()      # 只创建协程对象，什么都不执行！
print(coro)         # <coroutine object hello at 0x10c8e1440>
asyncio.run(coro)   # 交给事件循环驱动，才会真正执行
```

效果：`hello()` 调用后得到一个**协程对象**，函数体一行都没跑。必须把它交给 `asyncio.run()`、`create_task()` 或用 `await` 驱动。忘记这一步会看到 `RuntimeWarning: coroutine 'hello' was never awaited`。

### await 的语义：等待 + 让出

`await xxx` 做两件事：**挂起当前协程，把控制权还给事件循环**；等 `xxx` 完成后，**带着结果恢复执行**。事件循环则利用挂起的间隙去跑其他就绪的协程。

```python title="interleave.py"
import asyncio

async def worker(name: str, n: int):
    for i in range(n):
        print(f"{name}: step {i}")
        await asyncio.sleep(0.2)   # 让出控制权

async def main():
    await asyncio.gather(worker("A", 3), worker("B", 3))

asyncio.run(main())
```

效果：输出交错出现 `A: step 0`、`B: step 0`、`A: step 1`、`B: step 1`……两个「for 循环」在单线程里并发推进。如果把 `asyncio.sleep` 换成 `time.sleep`，就会先打完 A 再打 B——这就是「让出」与「占住」的区别。

### Task：被事件循环托管的协程

`create_task()` 把协程包装成 **Task**，立刻提交给事件循环调度——不需要等到 `await` 才开始跑。事件循环、协程、Task、`Future`（结果的占位容器）的关系：协程是待执行的代码，Task 是「已在后台运行的协程 + 结果容器」。日常写代码只需要协程和 Task，`Future` 一般只在对接回调/线程时碰面。

## 常用 API 速查表

按功能分成五组，组内按常用程度排序。「版本」列基于 Python 3.14 视角：无标注 = 各版本都有；`3.x+` = 最低版本要求；另有说明 = 废弃或行为变化。

### 任务与等待

| API | 一句话作用 | 常用度 | 版本 |
| :--- | :--- | :--- | :--- |
| `asyncio.run()` | 启动事件循环执行入口协程，结束自动清理 | ★★★ | 3.7+ |
| `await asyncio.sleep()` | 异步等待并让出控制权 | ★★★ | — |
| `asyncio.create_task()` | 协程立即后台开跑，返回 Task | ★★★ | 3.7+ |
| `asyncio.gather()` | 并发执行多个协程，按传入顺序收集结果 | ★★★ | — |
| `asyncio.wait_for()` | 给单个等待加超时，超时取消目标 | ★★★ | — |
| `asyncio.TaskGroup` | 结构化并发，一个失败全体取消 | ★★ | 3.11+ |
| `asyncio.timeout()` | 给一整段代码加超时（上下文管理器） | ★★ | 3.11+ |
| `asyncio.as_completed()` | 谁先完成先处理谁 | ★★ | timeout 参数 3.13+ |
| `asyncio.shield()` | 保护任务不被连带取消 | ★ | — |
| `asyncio.ensure_future()` | 泛化版 create_task：协程/Future 通吃 | ★ | 老代码常见 |
| `asyncio.wait()` | 底层等待：返回完成/未完成两组 | ★ | 3.11 起只接受 Task |
| `asyncio.timeout_at()` | 按绝对时刻（`loop.time()` 基准）设超时 | ★ | 3.11+ |

### 同步原语与队列

| API | 一句话作用 | 常用度 | 版本 |
| :--- | :--- | :--- | :--- |
| `asyncio.Queue` | 协程间安全队列（生产者/消费者） | ★★ | — |
| `asyncio.Semaphore` | 限制同时进行的协程数（限流） | ★★ | — |
| `asyncio.Lock` | 互斥锁，保护「读-改-写」序列 | ★★ | — |
| `asyncio.Event` | 一次性广播：条件就绪放行所有等待者 | ★★ | — |
| `asyncio.Condition` | 条件变量：等待特定状态变化再继续 | ★ | — |
| `asyncio.BoundedSemaphore` | 多 release 会报错的 Semaphore | ★ | — |
| `asyncio.PriorityQueue` / `LifoQueue` | 优先级队列 / 栈式队列 | ★ | — |
| `queue.shutdown()` | 优雅关闭队列：停止投递与消费 | ★ | 3.13+ |

### 网络流与子进程

| API | 一句话作用 | 常用度 | 版本 |
| :--- | :--- | :--- | :--- |
| `asyncio.open_connection()` | TCP 客户端，返回读写流 | ★★ | — |
| `asyncio.start_server()` | TCP 服务器，每个连接一个回调协程 | ★★ | — |
| `asyncio.create_subprocess_exec()` | 异步子进程（参数列表，不经 shell） | ★ | — |
| `asyncio.create_subprocess_shell()` | 异步子进程（整条命令行字符串） | ★ | 注入风险高于 exec |

### 线程/进程互操作

| API | 一句话作用 | 常用度 | 版本 |
| :--- | :--- | :--- | :--- |
| `asyncio.to_thread()` | 把阻塞函数丢进线程池 | ★★ | 3.9+ |
| `loop.run_in_executor()` | 指定执行器（线程池/进程池）跑同步函数 | ★ | — |
| `asyncio.run_coroutine_threadsafe()` | 其他线程向指定循环提交协程 | ★ | — |
| `loop.call_soon_threadsafe()` | 其他线程向指定循环提交回调 | ★ | — |
| `asyncio.eager_task_factory` | 任务工厂：create_task 时同步跑到第一个 await | ★ | 3.12+ |

### 事件循环管理与底层工具

| API | 一句话作用 | 常用度 | 版本 |
| :--- | :--- | :--- | :--- |
| `asyncio.get_running_loop()` | 拿当前运行中的循环（循环内专用） | ★★ | — |
| `loop.add_signal_handler()` | 响应 SIGINT/SIGTERM 优雅退出 | ★ | Unix 可用 |
| `loop.call_later()` / `call_at()` / `call_soon()` | 回调式定时与调度 | ★ | — |
| `asyncio.current_task()` / `all_tasks()` | 自省：我是谁、循环里还有谁 | ★ | — |
| `loop.create_future()` | 手工造 Future，桥接回调式 API | ★ | — |
| `asyncio.new_event_loop()` + `loop.run_until_complete()` | 手动管理循环（老代码模式） | ★ | 新代码用 `run()` |
| `asyncio.get_event_loop()` | ⚠️ 无运行循环时直接 `RuntimeError` | — | 3.14 移除自动创建 |
| `asyncio.iscoroutine()` / `iscoroutinefunction()` | ⚠️ 已废弃，改用 `inspect` 同名函数 | — | 3.14 起废弃，3.16 移除 |

## 基础用法详解

### asyncio.run()：程序的异步入口

```python title="run.py"
async def main():
    await asyncio.sleep(1)

asyncio.run(main())   # 整个程序通常只有一个 asyncio.run
```

效果：创建新事件循环 → 执行 `main()` → 结束时**取消所有残留后台任务**、关闭异步生成器、关闭线程池、销毁循环。注意它不能在已运行的事件循环里嵌套调用（会 `RuntimeError`），也不能在 Jupyter 里用——Jupyter 自带运行中的循环，直接 `await main()` 即可。

### asyncio.sleep()：异步世界的 time.sleep

```python title="sleep.py"
await asyncio.sleep(1)   # 让出控制权 1 秒
await asyncio.sleep(0)   # 立刻让出一次（仅让事件循环有机会跑别的任务）
```

`sleep(0)` 是个实用小技巧：长时间占着 CPU 的循环里插一个，可以让其他任务有机会执行。

### create_task()：让协程立刻开跑

```python title="create_task.py"
import asyncio

async def job() -> str:
    await asyncio.sleep(1)
    return "done"

async def main():
    task = asyncio.create_task(job(), name="job-1")  # 提交后立即开始执行
    print("task 已提交，先干点别的")
    await asyncio.sleep(0.5)
    result = await task          # 等它完成并取结果
    print(result)

asyncio.run(main())
```

效果：`create_task` 后 `job` 已经在后台跑到第一个 `await` 处；主流程继续执行打印；`await task` 时若已完成则立即拿到结果，否则等待。再次 `await` 同一个 Task 不会重跑，只取缓存结果。

::: warning 必须保存 Task 的引用
`asyncio.create_task(job())` 不赋值给变量的写法有坑：事件循环只持有任务的**弱引用**，任务可能在完成前被垃圾回收，悄然消失。标准写法是存进集合、完成后移除：

```python
background_tasks: set[asyncio.Task] = set()

task = asyncio.create_task(job())
background_tasks.add(task)
task.add_done_callback(background_tasks.discard)
```
:::

### ensure_future()：create_task 的泛化版本

老代码里大量出现的 `ensure_future`，在运行中的事件循环里对协程调用时**等价于 `create_task`**。区别在于它更「宽容」：

```python title="ensure_future.py"
import asyncio

async def main():
    loop = asyncio.get_running_loop()

    fut = loop.create_future()
    assert asyncio.ensure_future(fut) is fut    # 传 Future/Task：原样返回

    async def coro():
        return 42

    t = asyncio.ensure_future(coro())           # 传协程：包成 Task
    assert isinstance(t, asyncio.Task)
    print(await t)

asyncio.run(main())
```

| | `create_task(coro)` | `ensure_future(obj)` |
| :--- | :--- | :--- |
| 接受参数 | 仅协程，传 Future 会 `TypeError` | 协程 / Task / Future / 其他 awaitable |
| 已是 Future 时 | 报错 | 原样返回，不重复包装 |
| 命名 | `name=` 参数可命名 | 无 `name` 参数 |
| 建议 | 业务代码一律用它 | 写「接受任意 awaitable 参数」的通用库时用 |

注意一个常见误用：在没有运行循环的同步上下文里 `ensure_future(coro)` 试图「提前创建任务」，在 3.14 会直接报错（它内部依赖 `get_event_loop()`，而后者已不能自动创建循环）。任务创建必须发生在事件循环内——这也是「入口先 `asyncio.run`，内部再 `create_task`」的标准结构的原因。

### gather()：并发执行并收集结果

```python title="gather.py"
import asyncio

async def fetch(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name} 的响应"

async def main():
    # 三者并发，总耗时 ≈ 最长的 1.5s，而不是 1+1.5+2=4.5s
    results = await asyncio.gather(
        fetch("A", 1),
        fetch("B", 1.5),
        fetch("C", 2),
    )
    print(results)  # ['A 的响应', 'B 的响应', 'C 的响应']

asyncio.run(main())
```

效果：所有协程并发执行；`results` 是**按传入顺序**排列的列表（与完成先后无关）；总耗时约等于最慢的那个。这是「循环里逐个 `await`」的最常见优化替代——**顺序 `await` 是串行，`gather` 才是并发**。

两个关键细节：

- 默认模式下任何一个协程抛异常，`gather` 立刻把该异常抛给你，但**其余任务不会被取消**，仍在后台继续跑（其结果和异常都会被丢弃）。
- `return_exceptions=True` 改为收集异常：失败的位置放一个异常对象，成功的位置放结果，一个都不中断。

```python title="gather_return_exceptions.py"
results = await asyncio.gather(fetch("A", 1), fetch("坏", 0.5), fetch("C", 2),
                               return_exceptions=True)
# results = ['A 的响应', TimeoutError(...), 'C 的响应']（示意）
for r in results:
    if isinstance(r, Exception):
        print("有失败项:", r)
```

### TaskGroup：结构化并发（3.11+，推荐首选）

`TaskGroup` 解决 `gather` 的遗留问题：**一个任务失败，其余任务自动取消**，且退出 `with` 块保证所有任务已结束，不会有漏网的后台任务。

```python title="taskgroup.py"
import asyncio

async def job(i: int) -> int:
    await asyncio.sleep(i * 0.1)
    return i * i

async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(job(1))
        t2 = tg.create_task(job(2))
        t3 = tg.create_task(job(3))
    # 走到这里：三个任务全部完成（或已全部被取消）
    print(t1.result(), t2.result(), t3.result())  # 1 4 9

asyncio.run(main())
```

效果：写法比 `gather` 略啰嗦，但语义更强——异常会打包成 `ExceptionGroup` 抛出（见异常处理一节），兄弟任务被自动取消，不会出现「失败后其他任务还在空转」。新代码建议默认用它，需要收集所有结果（含失败）时用 `gather(return_exceptions=True)`。

### 超时控制：wait_for 与 timeout

```python title="timeout.py"
import asyncio

async def slow() -> str:
    await asyncio.sleep(10)
    return "finally"

async def main():
    # 方式一：wait_for —— 针对单个 awaitable
    try:
        result = await asyncio.wait_for(slow(), timeout=1)
    except TimeoutError:
        print("wait_for 超时，slow() 已被取消")

    # 方式二：timeout 上下文管理器（3.11+）—— 守护一整段代码
    try:
        async with asyncio.timeout(1):
            a = await asyncio.sleep(0.4)
            b = await asyncio.sleep(0.4)
            c = await asyncio.sleep(0.4)   # 累计 1.2s，在这里超时
    except TimeoutError:
        print("timeout 超时，卡住的那一步被取消")

asyncio.run(main())
```

效果与区别：

| | `wait_for(aw, t)` | `asyncio.timeout(t)` |
| :--- | :--- | :--- |
| 保护范围 | 单个 awaitable | 块内的**所有** await |
| 超时动作 | 取消目标任务，抛 `TimeoutError` | 在当前卡住的 await 处取消当前任务，转为 `TimeoutError` |
| 典型用途 | 单次请求限时 | 多步骤流程总限时 |

版本备注：3.10 及以前超时异常是 `asyncio.TimeoutError`；3.11 起它与内置 `TimeoutError` 合并为同一个类，`except TimeoutError` 通吃。

`asyncio.timeout` 还有个兄弟 `asyncio.timeout_at(deadline)`：接受 `loop.time()` 的**绝对时刻**而不是时长，适合「在某个统一截止时间前做完一批事」——先 `deadline = loop.time() + 30`，再给每个子步骤各套一个 `timeout_at(deadline)`，它们共享同一个截止点而不是各倒计时各的。

### as_completed()：谁先完成先处理

```python title="as_completed.py"
import asyncio

async def fetch(i: int):
    await asyncio.sleep(3 - i)          # i 越大越快完成
    return i

async def main():
    for fut in asyncio.as_completed([fetch(i) for i in range(3)]):
        result = await fut              # 每次拿到「当前最早完成」的结果
        print(f"拿到 {result}")

asyncio.run(main())
# 输出顺序：2, 1, 0（按完成先后），而不是 0, 1, 2
```

效果：适合「完成一个处理一个」的流式场景——比如实时把先回来的搜索结果刷给用户，而不是等全部到齐。`gather` 则相反：等全部完成后一次性给你完整列表。

3.13 起返回对象还支持 `async for` 迭代，并新增 `timeout` 参数：超时后迭代直接抛 `TimeoutError`，不再干等。

```python title="as_completed_timeout.py"
import asyncio

async def fetch(i: int, delay: float):
    await asyncio.sleep(delay)
    return i

async def main():
    tasks = [fetch(1, 0.1), fetch(2, 0.2), fetch(3, 30)]  # 第三个故意拖住
    try:
        async for fut in asyncio.as_completed(tasks, timeout=1):
            print("拿到", await fut)
    except TimeoutError:
        print("1 秒到了，不等了")

asyncio.run(main())
# 输出：拿到 1 / 拿到 2 / 1 秒到了，不等了
```

注意超时抛出后，未完成的任务**不会被自动取消**，需要自己收尾（`for t in tasks: t.cancel()`）。

### asyncio.wait()：更底层的等待

```python title="wait.py"
import asyncio

async def main():
    tasks = [asyncio.create_task(asyncio.sleep(i)) for i in range(3)]
    done, pending = await asyncio.wait(
        tasks, timeout=2, return_when=asyncio.FIRST_COMPLETED,
    )
    print(f"完成 {len(done)} 个，还剩 {len(pending)} 个")
    for t in pending:
        t.cancel()                      # 记得处理未完成的

asyncio.run(main())
```

效果：不返回结果，只把任务分成**完成/未完成**两组；可用 `return_when` 控制「首个完成」「首个异常」「全部完成」时返回。注意 3.11 起不能再直接传协程（必须先 `create_task`）。日常优先用 `gather`/`TaskGroup`，需要「等到第一笔就行动」这类精细控制时才用 `wait`。

### asyncio.Queue：协程间通信

```python title="queue.py"
import asyncio

async def producer(q: asyncio.Queue):
    for i in range(5):
        await q.put(i)                  # 队列满（maxsize）时会等待
    print("生产完毕")

async def consumer(q: asyncio.Queue):
    while True:
        item = await q.get()            # 队列空时会等待
        try:
            await asyncio.sleep(0.3)    # 模拟处理
            print(f"处理完 {item}")
        finally:
            q.task_done()               # 告诉队列：这个元素处理完了

async def main():
    q = asyncio.Queue(maxsize=3)
    workers = [asyncio.create_task(consumer(q)) for _ in range(2)]
    await producer(q)
    await q.join()                      # 阻塞到所有元素都 task_done()
    for w in workers:
        w.cancel()                      # 收尾：停掉常驻消费者

asyncio.run(main())
```

效果：生产者与两个消费者并发；队列是协程间传数据的标准方式（单线程内天然安全，无需加锁）。`q.join()` + `task_done()` 配对使用可以精确知道「全部处理完成」的时刻。

`Queue` 还有一组实用配套：

- **非阻塞接口**：`put_nowait()` / `get_nowait()` 队列满/空时直接抛 `QueueFull` / `QueueEmpty`；`qsize()` / `empty()` / `full()` 查看状态。
- **变体**：`asyncio.PriorityQueue` 取出的是最小的元素（放 `(优先级, 数据)` 元组），`asyncio.LifoQueue` 是栈式（后进先出）。实测顺序：

  ```python title="queue_variants.py"
  pq: asyncio.PriorityQueue = asyncio.PriorityQueue()
  for item in ((2, "b"), (1, "a"), (3, "c")):
      pq.put_nowait(item)
  # 取出顺序：a, b, c（按优先级 1,2,3）

  lq: asyncio.LifoQueue = asyncio.LifoQueue()
  lq.put_nowait(1)
  lq.put_nowait(2)
  # 取出顺序：2, 1（后进先出）
  ```

- **优雅关闭 `shutdown()`（3.13+）**：调用后 `put` 立刻抛 `QueueShutDown`，`get` 会把剩余元素取完、之后也抛 `QueueShutDown`。这让 worker 池可以**不用 cancel** 就自然退出：

  ```python title="queue_shutdown.py"
  async def worker(q: asyncio.Queue):
      while True:
          try:
              item = await q.get()
          except asyncio.QueueShutDown:   # 队列已关闭且取空 → 自然收工
              return
          try:
              await handle(item)
          finally:
              q.task_done()

  async def main():
      q = asyncio.Queue()
      workers = [asyncio.create_task(worker(q)) for _ in range(4)]
      for i in range(20):
          await q.put(i)
      await q.join()                      # 等全部处理完
      q.shutdown()                        # 广播「不会再有了」，worker 自动退出
      await asyncio.gather(*workers)      # 无需 cancel，无异常
  ```

  对比 `cancel()` 收尾：`shutdown` 让消费者把队列里已有的活干完再退出，语义更温和，也不会把 `CancelledError` 混进正常流程。

### Lock / Semaphore / Event / Condition：同步原语

**为什么单线程还要锁？** 因为 `await` 让出后，其他协程可能插进来修改共享状态，「先检查再修改」的序列会被打断：

```python title="lock.py"
import asyncio

balance = 100
lock = asyncio.Lock()

async def deduct(n: int):
    global balance
    async with lock:                    # 保护「读-改-写」整段
        if balance >= n:
            await asyncio.sleep(0)      # 这个 await 会让出，没有锁就可能超扣
            balance -= n

async def main():
    await asyncio.gather(*(deduct(30) for _ in range(3)))
    print(balance)  # 一定是 10；去掉锁可能变成 40

asyncio.run(main())
```

`asyncio.Lock` 用法与 `threading.Lock` 相似，但必须用 `async with`（等待锁时会释放事件循环）。原则：**锁住的区间越小越好，且锁内不要长时间 await**。

```python title="semaphore.py"
import asyncio

sem = asyncio.Semaphore(5)              # 最多 5 个并发

async def fetch(url: str):
    async with sem:                     # 拿不到名额就等待
        print(f"请求 {url}")
        await asyncio.sleep(1)          # 模拟请求
        return "ok"

async def main():
    # 1000 个任务全部创建，但任意时刻最多 5 个在执行
    await asyncio.gather(*(fetch(f"url-{i}") for i in range(1000)))

asyncio.run(main())
```

`Semaphore` 是对第三方 API 限流、避免打爆对方的标配：任务照常全量创建，执行被闸门约束。

```python title="event.py"
import asyncio

ready = asyncio.Event()

async def waiter(name: str):
    await ready.wait()                  # 事件未设置时挂起
    print(f"{name} 开始工作")

async def main():
    t1 = asyncio.create_task(waiter("A"))
    t2 = asyncio.create_task(waiter("B"))
    await asyncio.sleep(1)
    print("初始化完成，广播一次")
    ready.set()                         # 所有等待者同时恢复
    await asyncio.gather(t1, t2)

asyncio.run(main())
```

`Event` 适合「等某个条件就绪」的一次性广播：配置加载完、连接池建好后放行所有等待者。

`Condition` 是「锁 + 等待通知」的组合：等待方挂起直到状态满足，通知方改完状态后唤醒。适合「等缓冲区非空再消费、等水位下降再写入」这类**反复发生**的状态等待（`Event` 是一次性广播，`Condition` 可多次通知）：

```python title="condition.py"
import asyncio

cond = asyncio.Condition()
items: list[int] = []

async def consumer(n: int):
    async with cond:
        await cond.wait()               # 释放锁并挂起，被唤醒后重新拿锁
        print(f"consumer-{n} 看到 {items}")

async def producer():
    await asyncio.sleep(0.1)            # 确保消费者已进入等待
    async with cond:
        items.extend([1, 2, 3])
        cond.notify_all()               # 唤醒所有等待者（notify() 只唤醒一个）

async def main():
    await asyncio.gather(
        asyncio.create_task(consumer(1)),
        asyncio.create_task(consumer(2)),
        producer(),
    )

asyncio.run(main())
```

效果：两个 consumer 挂起在 `cond.wait()`，producer 放入数据后 `notify_all()` 把它们全部唤醒。注意 `wait()` 会**自动释放锁**（否则 producer 拿不到锁没法通知），唤醒后自动重新加锁——所以唤醒后访问共享状态仍是安全的。

`BoundedSemaphore` 是 `Semaphore` 的防呆版：`release()` 次数超过 `acquire()` 次数时立刻抛 `ValueError: BoundedSemaphore released too many times`（普通 `Semaphore` 会静默允许，计数变成无意义的多余名额）。除非有意用「预充值」技巧，否则默认选 `BoundedSemaphore` 更安全——不过实践中用 `async with sem:` 语法根本不会多 release，普通 `Semaphore` 配合上下文管理器已是主流写法。

## 异常处理

### 常见异常一览

| 异常 | 含义 | 常见来源 |
| :--- | :--- | :--- |
| `asyncio.CancelledError` | 任务被取消 | `task.cancel()`、超时取消、`TaskGroup` 连带取消。**继承自 `BaseException`**，`except Exception` 捕不到它 |
| `TimeoutError` | 等待超时 | `wait_for`、`asyncio.timeout`（3.11 起与 `asyncio.TimeoutError` 合并） |
| `ExceptionGroup` / `BaseExceptionGroup` | 多个任务异常打包 | `TaskGroup` |
| `RuntimeError` | 事件循环使用错误 | 在无运行循环处 `create_task`；嵌套 `asyncio.run` |
| `asyncio.QueueShutDown` | 队列已被 `shutdown()` | 3.13+；`put` 立刻抛，`get` 取空后抛 |
| `asyncio.QueueFull` / `QueueEmpty` | 非阻塞接口的满/空 | `put_nowait()` / `get_nowait()` |
| `InvalidStateError` | 对已完成的 Future 再次设值 | 手工操作 `Future` 时 |

### 单个协程：普通 try/except

```python title="try_except.py"
async def main():
    try:
        result = await fetch_with_retry()
    except (TimeoutError, ConnectionError) as e:
        print(f"请求失败: {e}")
    finally:
        await close_resources()         # 无论成败都清理
```

`await` 表达式和普通调用一样可以被 `try` 包住，没有任何特殊语法。

### gather：两种异常策略

见前文 `gather` 一节——默认「快速失败」（其余任务继续跑），`return_exceptions=True` 则「一个不落全部收集」。按需选择：**全部要结果**用后者，**任何一个失败就该放弃**用 `TaskGroup`。

### TaskGroup + except\*：分组捕获（3.11+）

`TaskGroup` 把所有失败任务的异常打包进 `ExceptionGroup`，Python 3.11 新增的 `except*` 语法按类型分组捕获：

```python title="except_star.py"
import asyncio

async def job(i: int):
    await asyncio.sleep(0.1)
    if i == 1:
        raise ValueError(f"参数错误: {i}")
    if i == 2:
        raise KeyError(f"缺少字段: {i}")
    return i

async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            for i in range(4):
                tg.create_task(job(i))
    except* ValueError as eg:           # eg 是 ExceptionGroup
        for exc in eg.exceptions:
            print("业务错误:", exc)
    except* KeyError as eg:
        for exc in eg.exceptions:
            print("数据错误:", exc)
    else:
        print("全部成功")

asyncio.run(main())
# 输出（任意顺序；KeyError 的 str() 自带引号）：
# 业务错误: 参数错误: 1
# 数据错误: '缺少字段: 2'
```

效果：任一任务抛异常，其余任务被取消，`with` 退出时抛出 `ExceptionGroup`；`except*` 能同时匹配多组异常且互不吞并。上例能同时捕到两种异常，是因为四个任务的 `sleep(0.1)` 同时刻到期、都在被取消前抛出了异常——**如果第二个任务还没跑到失败点就先被取消，它的异常不会进组**（表现为 `CancelledError`）。若不用 `except*`，也可以 `except BaseExceptionGroup as eg` 再手动拆 `eg.exceptions`。

### 重试模式

```python title="retry.py"
async def fetch_with_retry(url: str, retries: int = 3):
    for attempt in range(1, retries + 1):
        try:
            return await asyncio.wait_for(fetch(url), timeout=5)
        except TimeoutError:
            if attempt == retries:
                raise
            await asyncio.sleep(2 ** attempt)   # 指数退避：2s、4s、8s…
```

异步重试与同步无异，配合 `wait_for` 与退避 `sleep` 即可；需要更完备策略（jitter、熔断）时再考虑 `tenacity` 库。

## 取消与终止

### cancel() 的语义：在 await 点引爆

`task.cancel()` 不是立刻杀死任务，而是**请求取消**：在目标协程当前（或下一个）`await` 处抛出 `CancelledError`。如果任务卡在一个漫长的计算里（两个 await 之间），取消要等到它跑到下一个 await 才生效。

```python title="cancel.py"
import asyncio

async def job():
    try:
        await asyncio.sleep(100)
    except asyncio.CancelledError:
        print("被取消，做点清理")
        raise                           # 清理完务必重新抛出
    return "never"

async def main():
    task = asyncio.create_task(job())
    await asyncio.sleep(0.5)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("main 观察到任务已取消")

asyncio.run(main())
```

::: warning 两条纪律
1. **捕获取消异常后必须 `raise` 重新抛出**。吞掉 `CancelledError` 会让 `wait_for` 的超时、`TaskGroup` 的连带取消、`asyncio.run` 的退出清理全部失灵（表现为「超时了却没停下来」）。
2. **清理代码要快**。`except CancelledError` 里的清理如果又长时间 `await`，可能再次收到取消。理想做法是把清理放进 `finally` 或异步上下文管理器的 `__aexit__`。
:::

### shield()：防止「被连带取消」

取消会沿 await 链传播：外层任务被取消/超时时，正在 await 的内层任务通常一起被取消。若某操作**宁可超时也不能中断**（如支付提交、数据库写入），用 `shield` 包住：

```python title="shield.py"
import asyncio

async def save_to_db() -> str:
    await asyncio.sleep(3)
    return "已落库"

async def main():
    inner = asyncio.create_task(save_to_db())
    try:
        # 外层限时 1 秒；超时抛 TimeoutError，但 inner 继续在后台执行
        result = await asyncio.wait_for(asyncio.shield(inner), timeout=1)
    except TimeoutError:
        print("调用方超时先走，写入仍在后台进行")
        result = await inner            # 稍后仍可拿到它的结果
    print(result)

asyncio.run(main())
```

效果：`shield` 取消的是「外层的等待」，不取消被保护的任务本体。注意必须自己持有 `inner` 的引用，稍后再 `await` 它拿结果。

### uncancel() 与 cancelling()：消化取消计数（3.11+）

每次 `cancel()` 会让任务的取消计数 `task.cancelling()` 加一。绝大多数时候你不需要碰它——`TaskGroup`、`asyncio.timeout` 内部正是靠它判断「这次取消是否已被处理」。只有一种场景需要手工介入：**捕获 `CancelledError` 后既不想重抛、又想让外层知道取消已被消化**（比如「收到取消就快点返回已完成的部分结果」）：

```python title="uncancel.py"
import asyncio

async def job() -> str:
    task = asyncio.current_task()
    try:
        await asyncio.sleep(100)
    except asyncio.CancelledError:
        task.uncancel()                  # 取消计数 -1：向 timeout/TaskGroup 声明已处理
        return "收到取消，返回已完成的部分"

async def main():
    t = asyncio.create_task(job())
    await asyncio.sleep(0.1)
    t.cancel()
    print(await t)                       # 正常拿到返回值，而非 CancelledError

    print("剩余取消计数:", t.cancelling())  # 0

asyncio.run(main())
```

效果：`uncancel()` 把计数减回去后，任务以**正常返回**收尾而非被取消；`asyncio.timeout` 块里这样做可以让「超时但已有部分结果」的流程继续走而不是抛 `TimeoutError`。除非明确要这个语义，否则老老实实 `raise` 重新抛出取消异常。

### 响应终止信号：优雅退出

长驻服务要处理 Ctrl-C（SIGINT）和 `SIGTERM`（容器停止、systemctl stop）：

```python title="graceful_exit.py"
import asyncio
import signal

async def worker(stop: asyncio.Event, i: int):
    while not stop.is_set():
        await asyncio.sleep(1)
        print(f"worker-{i} 心跳")

async def main():
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)   # 信号到来 → 设置事件

    workers = [asyncio.create_task(worker(stop, i)) for i in range(3)]
    print("服务启动，Ctrl-C 退出")
    await stop.wait()                # 挂起，直到收到信号
    print("收到退出信号，等待 worker 收尾…")
    await asyncio.gather(*workers)   # worker 检测到 stop 后自然退出

if __name__ == "__main__":
    asyncio.run(main())
```

效果：进程收到 SIGINT/SIGTERM 后不立刻死亡，而是设置事件 → 各 worker 在循环边界检测到后退出 → 完成清理。这是「通知式退出」，比直接 cancel 温和；对无法改造成协作式退出的任务，也可以 `for t in tasks: t.cancel()` 强制收尾。

::: tip 平台差异
`loop.add_signal_handler` 在 Windows 上不可用（抛 `NotImplementedError`）。Windows 下用 `try/except KeyboardInterrupt` 兜底，或用 `signal.signal()` 注册普通回调。另外，`asyncio.run()` 自身会在退出时自动取消所有未完成任务，所以「忘了收尾」通常不会挂住进程，但资源清理（关闭连接、flush 缓冲）还是应该显式做。
:::

## 进阶用法

### async with 与 async for

```python title="async_with_for.py"
import asyncio

# 异步上下文管理器：进入/退出时可以 await，适合「异步获取 + 异步释放」的资源
class Conn:
    async def __aenter__(self):
        await asyncio.sleep(0.1)      # 模拟建连
        print("已连接")
        return self

    async def __aexit__(self, *exc):
        await asyncio.sleep(0.1)      # 模拟关连接，异常路径也会执行
        print("已断开")

# 异步生成器：yield 出来的每个值都要 await 去取
async def tick(n: int):
    for i in range(n):
        await asyncio.sleep(0.3)
        yield i

async def main():
    async with Conn() as conn:
        async for i in tick(3):       # 异步迭代：数据「慢慢产生」时逐个消费
            print(f"tick {i}")

asyncio.run(main())
```

效果：`async with` 保证清理逻辑在取消/异常时也执行（把清理写进 `__aexit__` 是比裸 `try/finally` 更抗取消的写法）；`async for` 逐个消费异步产生的数据。实际项目中最常见的是第三方库的异步上下文管理器，如 `async with httpx.AsyncClient() as client:` ——整个生命周期内复用连接池。

### 固定 worker 池：队列 + 常驻消费者

需要「任务数量未知、worker 数量固定」时（既限流又避免反复创建任务），用前文的 Queue 模式固定下来：

```python title="worker_pool.py"
import asyncio

async def worker(q: asyncio.Queue, wid: int):
    while True:
        url = await q.get()
        try:
            await asyncio.sleep(0.5)          # 模拟抓取
            print(f"[worker-{wid}] 完成 {url}")
        finally:
            q.task_done()

async def main():
    q = asyncio.Queue()
    workers = [asyncio.create_task(worker(q, i)) for i in range(4)]  # 固定 4 并发

    for i in range(20):                # 动态投递 20 个任务
        await q.put(f"url-{i}")

    await q.join()                     # 全部处理完
    for w in workers:
        w.cancel()
    await asyncio.gather(*workers, return_exceptions=True)

asyncio.run(main())
```

效果：无论投递多少任务，并发度恒为 worker 数量；任务间通过队列解耦，新增任务无需新建协程。这是异步服务里最常用的编排骨架。

### 后台任务与完成回调

```python title="done_callback.py"
import asyncio

def on_done(task: asyncio.Task):
    if task.cancelled():
        print(f"{task.get_name()} 被取消")
    elif task.exception():
        print(f"{task.get_name()} 失败: {task.exception()!r}")
    else:
        print(f"{task.get_name()} 成功: {task.result()}")

async def main():
    task = asyncio.create_task(asyncio.sleep(1), name="bg-job")
    task.add_done_callback(on_done)    # 回调在事件循环线程执行，要快
    print("主流程继续")
    await task

asyncio.run(main())
```

效果：回调在任务终结时于事件循环线程执行，适合打日志、级联触发下一个任务。注意回调里抛异常只会打日志，不会传播——错误传递仍以 `await task` 为准。

### 把回调式 API 包装成 Future

遇到只支持回调的老库（「完成时调你这个函数」），不想改造成回调地狱，可以手工造一个 `Future` 当结果占位容器，回调到来时 `set_result`：

```python title="future_bridge.py"
import asyncio

def legacy_api(loop: asyncio.AbstractEventLoop, callback):  # 假设：只支持回调的老库
    loop.call_later(0.5, callback, "来自回调的结果")        # 模拟 0.5s 后异步完成

async def call_legacy() -> str:
    loop = asyncio.get_running_loop()
    fut = loop.create_future()            # 一个「空占位结果」
    legacy_api(loop, fut.set_result)      # 完成时把结果塞进去
    return await fut                      # 回调式 API 摇身一变，可 await 了

async def main():
    print(await call_legacy())

asyncio.run(main())
# 0.5 秒后输出：来自回调的结果
```

效果：`await fut` 在 `set_result` 之前挂起，之后带着结果恢复。失败场景对应 `fut.set_exception(SomeError())`；在别的线程里设置结果则用 `loop.call_soon_threadsafe(fut.set_result, value)`。这就是 `Task` 底层的原理——「占位容器 + 完成时填值」。

### 网络流：open_connection 与 start_server

不引入 Web 框架时，asyncio 自带 TCP 流式收发。客户端拿到 `reader/writer` 两个流对象，服务器为每个连接跑一个回调协程：

```python title="stream.py"
import asyncio

async def handle(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    data = await reader.readexactly(4)    # 精确读 4 字节
    writer.write(data.upper())            # 写入发送缓冲区
    await writer.drain()                  # 缓冲区满时等待对端消费
    writer.close()
    await writer.wait_closed()

async def main():
    server = await asyncio.start_server(handle, "127.0.0.1", 0)  # 端口 0 = 随机空闲端口
    port = server.sockets[0].getsockname()[1]

    reader, writer = await asyncio.open_connection("127.0.0.1", port)
    writer.write(b"abcd")
    await writer.drain()
    print(await reader.readexactly(4))    # b'ABCD'

    writer.close()
    await writer.wait_closed()
    server.close()
    await server.wait_closed()

asyncio.run(main())
```

`StreamReader` 常用方法：`read(n)`（至多 n 字节）、`readline()`（按行，适合文本协议）、`readexactly(n)`（不够就抛 `IncompleteReadError`）、`readuntil(sep)`（读到分隔符）。`StreamWriter` 记住一对：`write()` 只入缓冲区，`drain()` 才负责背压（等对端收走）。做 HTTP/WebSocket 这类上层协议请直接用 `httpx`/`websockets` 库；`open_connection` 的主场是自定义 TCP 协议、硬件/工控设备通信。

### 异步子进程：流式读取输出

```python title="subprocess.py"
import asyncio

async def main():
    proc = await asyncio.create_subprocess_exec(
        "python", "-c", "print(1); print(2); print(3)",
        stdout=asyncio.subprocess.PIPE,
    )
    async for line in proc.stdout:     # 每产出一行就处理一行
        print("收到:", line.decode().strip())
    await proc.wait()                  # 回收退出码
    print("退出码:", proc.returncode)

asyncio.run(main())
```

效果：子进程输出**边产生边消费**，不会等进程结束才拿到全部输出，也不会因为输出量大撑爆管道缓冲。同时可以并发跑多个子进程、对每个都施加超时。`exec` 版按参数列表传（不经过 shell，安全）；要从字符串命令行解析时用 `create_subprocess_shell`。

### 定时与延迟执行

```python title="schedule.py"
import asyncio

async def heartbeat():
    while True:
        print("心跳")
        await asyncio.sleep(5)

async def main():
    loop = asyncio.get_running_loop()

    # 方式一：协程循环（推荐，可读、可取消、可 await）
    hb = asyncio.create_task(heartbeat())

    # 方式二：回调式延迟执行（简单一次性触发）
    loop.call_later(2.0, lambda: print("2 秒后的一次性回调"))

    await asyncio.sleep(10)
    hb.cancel()                        # 停掉心跳

asyncio.run(main())
```

`call_later/call_at` 是回调风格的定时器；`call_at` 接受的是 `loop.time()` 时钟的绝对时刻（不是 `time.time()`，不受系统改时间影响），适合「对齐整点执行」的调度；`call_later` 返回的 `TimerHandle` 可以 `.cancel()` 撤销。需要「周期任务 + 可取消 + 出错可见」时，`while True + sleep` 的任务版更可控。

### eager_task_factory：海量微任务的调度优化（3.12+）

默认 `create_task` 只是把任务排队，等下一轮循环才真正开始执行。`eager_task_factory` 改为**创建时就同步执行到第一个 `await`**——如果协程根本不 await 就跑完了（缓存命中、参数校验失败等场景），连一次调度都省掉：

```python title="eager.py"
import asyncio

async def cache_hit(key: str) -> str:
    if key in {"a", "b"}:
        return "cached"                  # 无 await，同步返回
    await asyncio.sleep(1)               # 未命中才走异步查询
    return "slow"

async def main():
    loop = asyncio.get_running_loop()
    loop.set_task_factory(asyncio.eager_task_factory)
    t = asyncio.create_task(cache_hit("a"))
    print(t.done(), t.result())          # True cached —— create_task 返回时已完成

asyncio.run(main())
```

效果：高频创建大量「可能立即完成」的小任务时能省可观的调度开销；代价是任务体在 `create_task` 调用点同步执行（不再立刻让出）。对成千上万的网络请求这种一定会 await 的任务收益有限，按需开启。

### 调试三板斧

```python title="debug.py"
asyncio.run(main(), debug=True)     # 或环境变量 PYTHONASYNCIODEBUG=1
```

打开 debug 模式后，日志里要重点认这三类输出：

| 日志 | 含义 | 排查方向 |
| :--- | :--- | :--- |
| `Executing <Task ...> took 0.500 seconds` | 某段代码占用循环超过 0.1 秒 | 定位阻塞调用，改异步库或 `to_thread` |
| `coroutine 'xxx' was never awaited` | 调了 async 函数却没驱动它 | 漏了 `await` / `create_task` |
| `Task exception was never retrieved` | 后台任务抛了异常但没人看 | fire-and-forget 前先想好谁来 `await` 或挂 `add_done_callback` |

配合 `asyncio.all_tasks()`（列出循环内所有任务）与 `task.get_name()`（创建时命名）可以在卡死时快速定位「谁还活着」。

顺带两个 3.14 的废弃/收紧项，读老代码时会遇到：`asyncio.get_event_loop()` 在没有运行循环时不再自动创建循环、直接抛 `RuntimeError: There is no current event loop`（想拿循环请在协程内用 `asyncio.get_running_loop()`）；`asyncio.iscoroutine()` / `asyncio.iscoroutinefunction()` 已废弃（3.16 移除），改用 `inspect` 模块的同名函数。

### 手动管理事件循环：老代码长这样

`asyncio.run()` 是 3.7 才有的入口。更早的教程和存量代码里，循环是手动创建、手动驱动的，读懂它们需要认识这组底层接口：

```python title="manual_loop.py"
import asyncio

async def main():
    await asyncio.sleep(0.1)
    return "done"

loop = asyncio.new_event_loop()          # 手动创建循环
try:
    result = loop.run_until_complete(main())   # 驱动到 main 完成，返回结果
    print(result)
    # loop.run_forever()                 # 长驻服务：一直跑直到 loop.stop()
finally:
    loop.close()                         # 手动清理
```

效果：`run_until_complete` 跑一个协程直到完成，期间循环可同时承载其他已注册的任务；`run_forever` 则一直运行（服务器主循环），由别处调用 `loop.stop()` 停下。新代码**不要**手写这套——`asyncio.run()` 把「创建、运行、取消残留任务、关闭」全包了。这个模式今天仍有两个正当用途：嵌入已有应用（宿主程序决定循环生命周期）、单元测试里精细控制循环。

### 嵌套事件循环的坑

同一个线程同一时刻只能有一个运行中的事件循环。因此在已运行循环的上下文里再调 `asyncio.run()` 会报 `RuntimeError: asyncio.run() cannot be called from a running event loop`——典型现场是 Jupyter Notebook 和某些框架的异步回调里。解法按优先级：

1. 框架本身是异步的（Jupyter、FastAPI 等）→ 直接在最外层 `await main()`，不要 `run`。
2. 同步代码要「等一个异步结果」→ 把入口改成异步的，自上而下保持一个循环。
3. 确实无法改造的遗留代码 → 用线程隔离：在新线程里创建独立循环跑异步部分（见下一节 `run_coroutine_threadsafe` 的反向用法）。

不建议用 `nest_asyncio` 这类补丁库，它掩盖结构问题且与 3.12+ 兼容性差。

## 结合线程与进程提升执行效率

异步不是「唯一选择」，而是拼图的一块。混用原则按任务性质选执行位置：

| 任务性质 | 例子 | 执行位置 | 工具 |
| :--- | :--- | :--- | :--- |
| 网络等待，库有异步版 | `httpx`、`aiohttp`、`asyncpg` | 事件循环 | 纯 `await` |
| 阻塞调用，库只有同步版 | `requests`、`pandas.read_csv`、同步驱动 | 线程池 | `asyncio.to_thread()` |
| CPU 密集 | 哈希、压缩、图像、数值计算 | 进程池 | `ProcessPoolExecutor` + `run_in_executor` |
| 极简脚本、少量并发 | 调三五个接口 | — | 直接 `ThreadPoolExecutor`，不必上 asyncio |

### to_thread()：救急阻塞库（3.9+）

```python title="to_thread.py"
import asyncio
import requests

async def fetch(url: str):
    # requests.get 在默认线程池里跑，事件循环不被阻塞
    resp = await asyncio.to_thread(requests.get, url, timeout=5)
    return resp.text

async def main():
    results = await asyncio.gather(*(fetch(u) for u in ["https://example.com"] * 10))
    print(len(results), "个页面抓取完成")

asyncio.run(main())
```

效果：同步的 `requests` 照用，但 10 个请求并发执行，事件循环（及其他协程）全程不被卡住。`to_thread` 还会传播 `contextvars`，日志上下文不丢。与手工 `run_in_executor` 相比它更简洁，是处理「个别阻塞调用」的首选。

### run_in_executor()：CPU 密集丢进程池

```python title="process_pool.py"
import asyncio
import hashlib
from concurrent.futures import ProcessPoolExecutor

def sha256_of(data: bytes) -> str:      # 纯 CPU 计算，必须放进程里才利用多核
    return hashlib.sha256(data).hexdigest()

async def main():
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as pool:             # 进程池：绕开 GIL 真并行
        digests = await asyncio.gather(*(
            loop.run_in_executor(pool, sha256_of, b"x" * 10_000_000)
            for _ in range(8)
        ))
    print(digests[0])

if __name__ == "__main__":              # macOS/Windows 默认 spawn，必须有这个保护
    asyncio.run(main())
```

效果：8 次哈希在多个进程里**并行**计算（多核利用），主协程 `await` 期间事件循环仍可服务其他协程。要点：被计算的函数与参数必须可 pickle；进程池开销大，任务要「够重」才值得（经验值：单任务几十毫秒以上）。

顺带一提 3.14 的 free-threaded 构建（`python3.14t`）已正式支持无 GIL 运行，届时线程池（`ThreadPoolExecutor` + `run_in_executor`）也能真并行跑 CPU 任务——但它需要单独安装，且部分 C 扩展生态尚未适配；对可移植性有要求的代码，进程池仍是默认答案。

### 综合示例：下载（异步）+ 解析（进程池）+ 落盘（线程）

```python title="pipeline.py"
import asyncio
import hashlib
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from pathlib import Path

def parse(html: str) -> str:            # CPU 密集：进程池
    return hashlib.sha256(html.encode()).hexdigest()

def write(path: str, text: str):        # 阻塞 IO：线程池
    Path(path).write_text(text)

async def download(client, url: str) -> str:   # 网络 IO：纯异步
    resp = await client.get(url)
    return resp.text

async def process_one(client, pool, url: str) -> str:
    loop = asyncio.get_running_loop()
    html = await download(client, url)                 # 1. 异步下载
    digest = await loop.run_in_executor(pool, parse, html)  # 2. 进程池解析
    await asyncio.to_thread(write, f"/tmp/{digest[:8]}.txt", digest)  # 3. 线程落盘
    return digest

async def main():
    urls = [f"https://example.com/{i}" for i in range(20)]
    import httpx
    async with httpx.AsyncClient(timeout=10) as client:      # 复用连接池
        with ProcessPoolExecutor() as pool:
            digests = await asyncio.gather(
                *(process_one(client, pool, u) for u in urls)
            )
    print(f"完成 {len(digests)} 条流水线")

if __name__ == "__main__":
    asyncio.run(main())
```

效果：三类任务各就其位——下载靠异步撑并发、解析靠多进程吃满 CPU、落盘靠线程不堵循环，整条流水线没有一处「占住事件循环干等」。

### 与线程世界互操作

从普通线程里向事件循环提交协程（常见于同步回调框架里调异步代码）：

```python title="thread_bridge.py"
import asyncio
import threading

async def async_work(x: int) -> int:
    await asyncio.sleep(0.5)
    return x * 2

def sync_caller(loop: asyncio.AbstractEventLoop):
    # 线程安全地向指定循环提交协程，返回 concurrent.futures.Future
    fut = asyncio.run_coroutine_threadsafe(async_work(21), loop)
    print("结果:", fut.result(timeout=5))   # 阻塞当前线程直到完成

async def main():
    loop = asyncio.get_running_loop()
    t = threading.Thread(target=sync_caller, args=(loop,))
    t.start()
    await asyncio.sleep(0)               # 让子弹飞一会儿
    await asyncio.get_running_loop().run_in_executor(None, t.join)

asyncio.run(main())
```

记住方向规则：**线程 → 循环**用 `run_coroutine_threadsafe`（协程）或 `loop.call_soon_threadsafe`（回调）；**循环 → 线程**就是普通的线程池接口（`to_thread` / `run_in_executor`）。事件循环对象本身不是线程安全的，绝不能在别的线程里直接 `loop.run_forever()` 或 `create_task`。

## 常见坑清单

按「踩中概率」排序，收尾自检：

1. **忘了 `await`**：调了 async 函数没 `await`，得到协程对象，函数体根本没执行，伴随 `never awaited` 警告。debug 模式下无所遁形。
2. **顺序 `await` 以为是并发**：`for` 循环里逐个 `await fetch(u)` 是串行，总耗时是累加。要么 `gather`，要么 `create_task` 后统一等。
3. **阻塞调用混进来**：`time.sleep`、`requests`、同步驱动、大文件 `read()`，一个就把全部协程拖停。见「开始之前」一节。
4. **fire-and-forget 任务被回收**：`create_task` 不保存引用，任务可能被 GC 悄悄干掉；异常也没人消费。存引用 + 想清楚谁取结果。
5. **吞掉 `CancelledError`**：`except Exception` 捕不到它（继承 `BaseException`），但宽泛的 `except BaseException` 或裸 `except:` 捕到后不重抛，会让超时与优雅退出失灵。
6. **`gather` 失败后忘了兄弟任务还在跑**：默认模式抛异常时其余任务不会被取消，可能继续消耗资源。需要「同生共死」语义就用 `TaskGroup`。
7. **每轮循环新建 `AsyncClient`/`ClientSession`**：连接池没有复用，握手开销叠加甚至触发对端限连。把 `async with client` 提到循环外层。
8. **CPU 密集塞进协程**：改不出性能还堵死循环，丢进程池（`run_in_executor` + `ProcessPoolExecutor`）。
9. **老教程的循环管理代码搬到 3.14 直接报错**：`asyncio.get_event_loop()`（无运行循环时自动建循环）已被移除，`asyncio.iscoroutine*()` 已废弃。老代码统一迁移到 `asyncio.run()` + `create_task` + `inspect.iscoroutine*`。

## 延伸阅读

需要「等待可以随时被人按键接管」的交互式异步脚本，可以继续看这篇实战：[可跳过的等待：控制台脚本按键转人工与恢复执行](/blog/06842poo/)。
