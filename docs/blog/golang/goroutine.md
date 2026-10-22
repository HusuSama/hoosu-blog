---
title: Go 协程教程：从 goroutine 入门到并发工程实践
createTime: 2026/10/22 10:00:00
tags:
  - golang
  - 并发
  - goroutine
permalink: /blog/l85z0upt/
---

本文面向会写 Go 函数、循环和结构体，但尚未系统学习并发的读者。按照顺序学习，你将能启动并等待任务、传递结果、取消工作、保护共享数据，并为批处理和服务接口选择合适的并发方案。

**示例基线是 Go 1.22+**，不是建议生产环境停留在旧版本。实际项目应使用仍受支持的 Go 版本。文中 API 表格按本节业务开发中的常用程度排列，不是性能排名。所有完整的 `package main` 示例应放在各自目录的 `main.go` 中单独运行，不要全部复制到同一个包。

[[TOC]]

## 一、先理解：并发解决什么问题

### 1. 并发不是让所有程序自动变快

假设订单页面需要查询用户资料、库存和优惠券：三次请求没有依赖，可以同时发起。串行耗时接近三者之和，并发耗时接近最慢的一项，再加调度和汇总开销。

如果必须先查用户 ID，再根据 ID 查订单，两步有依赖，不能靠加一个 `go` 就消除依赖。

- **并发**：多个任务在同一时间段内推进，单核也能通过交替执行实现。
- **并行**：多个任务在同一时刻执行，需要相应的计算资源。
- **I/O 密集**：主要等待网络、数据库或磁盘；并发可以利用等待时间。
- **CPU 密集**：主要做压缩、哈希或计算；Go 可以通过多个 goroutine 利用多核，但并发过高会增加竞争。

### 2. 进程、线程、goroutine 是什么关系

| 概念 | 谁管理 | 内存与隔离 | 在 Go 中的用途 |
| --- | --- | --- | --- |
| 进程 | 操作系统 | 通常有独立地址空间，通过 IPC 通信 | 服务实例、外部工具、故障隔离 |
| 线程 | 操作系统 | 同进程内共享地址空间，有独立执行栈等状态 | 承载实际执行，由 Go runtime 管理为主 |
| goroutine | Go runtime | 同进程共享内存，栈可动态增长 | 开发者通常直接使用的并发执行单元 |

一个 Go 进程可以有多个操作系统线程，多个 goroutine 被调度到这些线程上执行。goroutine 通常比线程轻量，但不是零成本：栈、引用的对象、计时器、连接和排队任务都会消耗资源。

::: important 不要套用其他语言的协程结论

Go 的 goroutine 不需要 `async` / `await`，也不局限于单线程事件循环。它可以多核并行，runtime 也支持抢占式调度；不能把“两个等待点之间的代码”当作天然原子操作。共享数据仍然需要同步。

:::

### 3. 开始前的运行方式

安装 Go 后，在一个新的练习目录执行：

```sh title="setup.sh"
go mod init example.com/concurrency-demo
# 将本节完整示例保存为 main.go
go run .
# 在支持 race detector 的平台上检查实际执行路径中的数据竞争
go run -race .
```

`go run -race` 会增加运行开销，用于开发和验证，不是性能测试模式。没有报告不等于所有可能的执行路径都没有竞争。

## 二、第一个 goroutine：启动不等于完成

普通调用 `work()` 会等待函数返回；`go work()` 启动新的 goroutine，调用方继续执行。`go` 语句不会返回任务句柄，也不会自动把函数返回值送回调用方。

### 1. 用 WaitGroup 等待一组任务

| API / 语法 | 用途 | 必须记住 |
| --- | --- | --- |
| `go f(args)` | 在新 goroutine 执行函数 | 参数在调用方求值；执行完成顺序不保证 |
| `wg.Add(n)` | 增加待完成任务数 | 首批任务先 `Add`，再启动，最后 `Wait` |
| `wg.Done()` | 一个任务完成，计数减一 | 通常在任务入口 `defer wg.Done()` |
| `wg.Wait()` | 等待计数归零 | 不收集错误、不取消任务、不保护共享数据 |
| `wg.Go(f)` | 启动任务并管理计数 | Go 1.25+；传入函数不得 panic，本文基线示例不用 |

```go title="hello/main.go"
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Println("任务", id)
        }(i)
    }
    wg.Wait()
    fmt.Println("全部完成")
}
```

输出包含任务 1、2、3，三行顺序不确定；“全部完成”最后输出。

为什么不能用 `time.Sleep(time.Second)` 等任务？因为机器负载、网络和任务数量变化后，一秒可能不够，也可能白等。等待应依赖完成信号，而不是猜时间。

### 2. 生命周期与常见错误

- `main` 返回后，进程结束，不会自动等其他 goroutine，也不能指望它们的 `defer` 都执行。
- 不要在新 goroutine 内才 `Add(1)`：调用方可能已经看到计数为零并从 `Wait` 返回。
- `Done` 多调用会导致负计数 panic；少调用会使等待无法结束。
- `WaitGroup`、`Mutex` 等同步对象使用后不能复制；需要传递时通常用指针。
- 新一批任务必须在前一批 `Wait` 返回之后开始，避免混淆计数生命周期。

示例显式传入 `id`，便于看清每个任务收到的数据。Go 1.22 语言版本中，循环内通过 `:=` 声明的迭代变量按迭代独立；但外部变量、通过 `=` 赋值的循环变量、指针指向的对象仍可能被共享。升级语言版本不能解决所有闭包竞争。

## 三、channel：传结果，也建立同步关系

channel 是带类型的通信通道。可以把它理解为交接点：发送方交出一个值，接收方取走这个值。

### 1. 最常用的操作

| API / 语法 | 用途 | 阻塞或边界行为 |
| --- | --- | --- |
| `make(chan T)` | 创建无缓冲通道 | 发送和接收需要配对才能完成 |
| `ch <- value` | 发送 | 无接收者且无可用缓冲时阻塞 |
| `value := <-ch` | 接收 | 没有可读值且未关闭时阻塞 |
| `make(chan T, n)` | 创建容量为 n 的通道 | 缓冲满后发送仍阻塞 |
| `close(ch)` | 宣布不再发送 | 不是清空通道，也不是取消正在运行的函数 |
| `value, ok := <-ch` | 区分有效值与关闭 | 关闭且排空后，得到零值与 `false` |
| `for value := range ch` | 持续接收直到排空并关闭 | 未关闭且无新数据时会一直等待 |
| `chan<- T` / `<-chan T` | 限制参数只能发送 / 接收 | 在编译期表达使用权限 |
| `len(ch)` / `cap(ch)` | 查看当前缓冲量 / 容量 | `len` 只是瞬时观察，不能用来保证后续收发安全 |

### 2. 一个生产者，一个消费者

```go title="channel/main.go"
package main

import "fmt"

func produce(out chan<- int) {
    defer close(out)
    for i := 1; i <= 3; i++ {
        out <- i * i
    }
}

func main() {
    values := make(chan int)
    go produce(values)
    for value := range values {
        fmt.Println(value)
    }
    fmt.Println("接收完成")
}
```

输出依次为 `1`、`4`、`9`、“接收完成”。接收循环同时完成了结果消费与结束等待，这里不再需要额外的 `WaitGroup`。

缓冲区只允许生产者暂时领先消费者。把容量改成 100，并不会让慢消费者处理得更快，只会允许更多任务留在内存中。

### 3. 关闭规则必须先约定

**由能够证明“所有发送已结束”的一方关闭通道。** 单生产者通常自己关闭；多生产者通常由协调者等所有生产者完成后关闭。消费者不要因为“不想读了”就关闭仍有发送者的通道，应发送取消信号。

| 通道状态 | 发送 | 接收 | `close` |
| --- | --- | --- | --- |
| 正常打开 | 按容量和接收者情况执行或阻塞 | 有值就读，否则阻塞 | 成功 |
| 已关闭 | panic | 先读取剩余值，再返回零值与 `false` | panic |
| `nil` | 永久阻塞 | 永久阻塞 | panic |

不需要关闭每一个 channel 来“释放内存”；没有引用后由 GC 回收。关闭是通信协议，常用于让 `range` 结束。发送与关闭并发发生也不安全。

channel 发送 slice、map 或指针不会深复制底层数据。把 `[]byte` 发出去后又改同一个底层数组，接收方可能发生竞争。要么转移所有权，发送后不再改；要么复制；要么显式同步。

## 四、select 与 context：让等待能够结束

`select` 在多个通道操作之间选择。多个分支同时就绪时会伪随机选择，**不是写在前面的优先**；没有就绪分支时阻塞，除非存在 `default`。

### 1. 常用 API

| API / 语法 | 用途 | 注意事项 |
| --- | --- | --- |
| `select { case ... }` | 等待多个通信事件 | 取消与结果同时就绪时，没有取消优先保证 |
| `context.WithTimeout(parent, d)` | 创建带超时的子上下文 | 即使提前返回，也调用 `cancel()` 释放关联资源 |
| `context.WithCancel(parent)` | 创建可手动取消的子上下文 | 取消会传播给派生上下文，不会向上传播 |
| `ctx.Done()` | 获取取消通知通道 | 取消时关闭；`Background` 的 `Done` 为 `nil` |
| `ctx.Err()` | 查看取消原因 | 未取消为 `nil`，取消或超时后返回相应错误 |
| `context.Background()` | 创建顶层根上下文 | 请求内部通常使用 `r.Context()`，不要重建根上下文 |
| `context.WithDeadline(parent, t)` | 指定绝对截止时间 | 子上下文不能延长父上下文的截止时间 |
| `time.NewTimer(d)` / `timer.Stop()` | 一次性计时 | 复杂重置逻辑有版本差异，初学阶段优先保持简单 |
| `time.NewTicker(d)` / `ticker.Stop()` | 周期性触发 | `Stop` 不关闭 `ticker.C`，退出仍需取消分支 |
| `time.After(d)` | 简单的一次性等待 | 高频循环优先考虑复用计时器，注意分配与版本差异 |

### 2. 可取消任务的完整示例

```go title="cancel/main.go"
package main

import (
    "context"
    "errors"
    "fmt"
    "time"
)

func work(ctx context.Context) error {
    timer := time.NewTimer(time.Hour)
    defer timer.Stop()
    select {
    case <-ctx.Done():
        return ctx.Err()
    case <-timer.C:
        return nil
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
    defer cancel()
    done := make(chan error, 1)
    go func() {
        done <- work(ctx)
    }()
    err := <-done
    fmt.Println("超时退出:", errors.Is(err, context.DeadlineExceeded))
}
```

输出 `超时退出: true`。这里接收 `done` 是在等待任务真正返回，不只是看到超时信号就宣布任务结束。

::: warning 取消是协作，不是强杀

Go 没有通用的“杀掉某个 goroutine”API。`cancel()` 只是通知；如果任务不检查上下文，或者调用了不支持取消的阻塞函数，它仍可能继续执行。给外层套一个超时 `select`，不能自动终止里面的工作。

:::

### 3. 工作中如何传 context

- 通常作为函数第一个参数：`func Query(ctx context.Context, id int) error`，不要传 `nil`。
- HTTP 使用 `http.NewRequestWithContext`；SQL 使用 `QueryContext` / `ExecContext`，并确认驱动的取消支持。
- 长计算按合适粒度检查 `ctx.Err()`，不要每个极小操作都检查，也不要整个大循环完全不检查。
- 可阻塞的发送写成 `select { case out <- value: case <-ctx.Done(): return }`。
- `WithValue` 只用于请求范围的元数据，不是可选参数包，更不能用来绕过明确的依赖传递。

不要写一个带 `default` 的无限循环来反复检查有没有任务：没有任务时它会忙等烧 CPU。也不要对已关闭通道永远重复接收：它始终就绪，可能造成空转；应退出或将该通道变量设为 `nil`，禁用对应分支。

## 五、共享内存：Mutex、atomic 与所有权

### 1. 为什么 `count++` 不安全

`count++` 包含读取、计算、写回。两个 goroutine 可能读取同一个旧值，覆盖彼此的更新。即使最后碰巧得到正确结果，程序依然可能存在数据竞争。

`WaitGroup` 只保证最终等待完成，不会让任务之间的更新互斥；`GOMAXPROCS=1` 也不是锁。

| API / 类型 | 常见用途 | 选用建议 |
| --- | --- | --- |
| `sync.Mutex.Lock/Unlock` | 保护共享状态和多个字段的不变量 | 默认从它开始，临界区保持简短 |
| `sync.Once.Do` | 并发安全地执行一次初始化 | 不适合失败后自动重试；函数 panic 后也视为已经执行 |
| `sync.RWMutex.RLock/RUnlock` | 允许多个只读访问并行 | 只有测量证明值得时使用；不支持读锁直接升级为写锁 |
| `atomic.Int64.Add/Load/Store` | 独立计数器、简单状态 | Go 1.19+；多个原子变量不会自动组成原子事务 |
| `sync.Map.Load/Store/LoadOrStore` | 特定并发访问模式的 map | 不是普通 map 的默认替代，复杂不变量仍需锁 |
| `sync.Pool.Get/Put` | 复用临时对象，减少分配 | **不是 goroutine 池**；对象可能被 GC 清除 |

### 2. 用锁保护计数

```go title="mutex/main.go"
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    var mu sync.Mutex
    count := 0
    for i := 0; i < 4; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := 0; j < 1000; j++ {
                mu.Lock()
                count++
                mu.Unlock()
            }
        }()
    }
    wg.Wait()
    fmt.Println(count)
}
```

输出 `4000`。所有并发更新都在同一把锁下，主 goroutine 在 `Wait` 返回后读取结果。

实际业务中锁保护的是“不变量”，例如余额扣除和流水记录的内存状态必须一致，不能只分别给两个字段做原子操作。不要持有锁进行慢网络请求；锁顺序不一致、重复获取同一把非重入锁，都可能死锁。

### 3. 什么时候用 channel，什么时候用锁

| 问题 | 优先方案 | 原因 |
| --- | --- | --- |
| 多任务更新一个缓存或内存索引 | `Mutex` + 普通 map | 直接保护共享结构，容易审查 |
| 把任务交给另一个执行单元 | channel | 表达任务交接和背压 |
| 广播“可以退出了” | context | 传播取消，不需要给每个任务发送一次消息 |
| 收集固定数量任务的结果 | 预分配 slice，各任务写独立下标，最后等待 | 不需要并发 `append`，也不需要额外汇总锁 |
| 独立成功计数器 | `atomic.Int64` | 原子操作即可表达需求 |

预分配 slice 的技巧只适用于**不同任务写不同元素**、没有共享底层对象竞争，且主协程等待完成后才读取。并发 `append` 或一边写一边遍历并不因此安全。

## 六、进阶编排：用 errgroup 同时处理错误和取消

`WaitGroup` 适合“等所有工作结束”；一组任务有错误返回、失败时需要通知其他任务停止，使用 `golang.org/x/sync/errgroup` 更直接。它是 Go 扩展模块，**不是标准库，也不是复用 worker 的协程池**。

### 1. 安装与 API

本节固定版本便于 Go 1.22 环境复现，不表示它是最新版本。真实项目升级时应检查模块要求的 Go 版本。

```sh title="errgroup/setup.sh"
go get golang.org/x/sync@v0.11.0
```

| API | 用途 | 关键语义 |
| --- | --- | --- |
| `errgroup.WithContext(ctx)` | 创建任务组和派生上下文 | 首个任务错误或 `Wait` 返回时取消派生上下文 |
| `g.Go(func() error)` | 启动一个任务 | 配置并发上限后，提交可能阻塞 |
| `g.Wait()` | 等所有任务退出并返回首个非 nil 错误 | 不是第一个错误发生后立即返回，不聚合全部错误 |
| `g.SetLimit(n)` | 限制活跃任务数量 | 开始任务前设置；任务运行期间不能修改；0 阻止新任务进入 |
| `g.TryGo(f)` | 有空位才启动 | 返回 `false` 时任务没有执行，必须自行处理 |

### 2. 实战：并发请求多个接口，按输入顺序返回

下面使用本机测试 HTTP 服务，复制运行不需要外部网络。`httptest` 只负责提供可复现的服务；`fetchAll` 的请求和取消逻辑可用于真实接口。

```go title="errgroup/main.go"
package main

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "net/http/httptest"
    "time"

    "golang.org/x/sync/errgroup"
)

func fetchAll(ctx context.Context, client *http.Client, urls []string) ([]string, error) {
    g, taskCtx := errgroup.WithContext(ctx)
    g.SetLimit(3)
    results := make([]string, len(urls))
    for i, url := range urls {
        i, url := i, url
        g.Go(func() error {
            req, err := http.NewRequestWithContext(taskCtx, http.MethodGet, url, nil)
            if err != nil {
                return err
            }
            resp, err := client.Do(req)
            if err != nil {
                return err
            }
            defer resp.Body.Close()
            if resp.StatusCode != http.StatusOK {
                return fmt.Errorf("请求 %s: HTTP %d", url, resp.StatusCode)
            }
            const maxBody = 1 << 20
            body, err := io.ReadAll(io.LimitReader(resp.Body, maxBody+1))
            if err != nil {
                return err
            }
            if len(body) > maxBody {
                return fmt.Errorf("请求 %s: 响应超过 1 MiB", url)
            }
            results[i] = string(body)
            return nil
        })
    }
    if err := g.Wait(); err != nil {
        return nil, err
    }
    return results, nil
}

func main() {
    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path == "/fail" {
            http.Error(w, "失败", http.StatusServiceUnavailable)
            return
        }
        fmt.Fprint(w, r.URL.Path)
    }))
    defer server.Close()
    client := &http.Client{Timeout: 2 * time.Second}
    defer client.CloseIdleConnections()
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()
    values, err := fetchAll(ctx, client, []string{server.URL + "/user", server.URL + "/stock"})
    fmt.Println(values, err)
    _, err = fetchAll(ctx, client, []string{server.URL + "/fail"})
    fmt.Println("识别失败:", err != nil)
}
```

输出第一行为 `[/user /stock] <nil>`，第二行为 `识别失败: true`。

需要注意：

1. 输入顺序由结果下标保证，不代表请求完成顺序。
2. 复用 `http.Client`，关闭响应体，限制响应大小；HTTP 4xx/5xx 不会自动成为 `client.Do` 的错误。
3. 返回首个错误时，本例舍弃部分成功结果。批量导入若需要“每条都完成并报告错误”，应为每条任务保存结果和错误，而不是遇到错误取消整批。
4. `SetLimit` 限制执行数量，但 `g.Go` 等空位本身不提供 context 取消分支。任务必须能响应取消、最终释放空位。要求提交等待也可取消时，用下一节的通道方案。
5. `Wait` 返回后不能继续用派生的 `taskCtx` 发起新请求，因为它已取消。
6. 不要在同一个满额组的任务里继续 `g.Go` 并等待子任务，可能因所有名额被父任务占用而死锁。

在 HTTP handler 中，把调用参数换成 `r.Context()`，并根据业务错误返回合适状态。`net/http` 已经并发处理请求，不要为了“支持并发”再把整个 handler 包进一个无人等待的 goroutine。

## 七、到底需不需要协程池

### 1. 先区分三个需求

- **并发上限**：同时最多执行多少任务，保护 CPU、数据库、下游服务。
- **排队上限**：执行不过来时最多留多少任务，避免内存无限增长。
- **worker 复用**：让一组长期存活的 goroutine 不断领取任务，减少高频创建开销。

这三个需求相关，但不是一回事。goroutine 创建通常不昂贵，不能仅凭“线程要池化”就断言 Go 必须使用协程池。

| 场景 | 建议 | 原因 |
| --- | --- | --- |
| 少量、固定数量的独立任务 | `go` + `WaitGroup` / `errgroup` | 简单且生命周期清晰 |
| 有限批次，需要错误传播和并发限制 | `errgroup.SetLimit` | 不必维护长期存活的池 |
| 批量请求，只需要限制同时执行数 | 在启动前获取 semaphore 令牌 | 有背压，不需要复用 worker |
| 长期消费任务，明确要求有界队列 | 固定 worker + 有缓冲 channel | 同时约束执行数与积压 |
| 大量高频短任务，测量表明确有收益 | 考虑 `ants` 等成熟池 | 复用 worker，并提供容量与过载控制 |
| 必须跨重启保留、重试或审计的任务 | 持久化消息队列 + 消费者 | 内存协程池不提供任务可靠性 |

### 2. 并发限制不等于限速

并发数 20 表示同一时刻最多 20 个任务。任务耗时 10 毫秒与 1 秒时，产生的每秒请求量完全不同。下游要求“每秒最多 100 次”时，需要速率限制器，而不只是协程池。

初始容量可以这样确定，再通过压测调整：

- CPU 密集：从接近 `runtime.GOMAXPROCS(0)` 的数量开始，留意主业务和其他 goroutine 的 CPU 需求。
- I/O 密集：结合下游允许并发、连接池、文件描述符、响应延迟和内存限制。
- 稳态下可用“目标吞吐量 × 平均耗时”估算在途任务数，但它不是容量承诺；长尾、突发和下游限额都需要额外考虑。
- 每个请求内部限制为 10，不意味着整个服务限制为 10；多个请求会叠加，需要共享的服务级预算。

队列容量也不是越大越好。大队列可能只是在掩盖处理速度不足，导致任务等到开始执行时已经超时。满载时应明确选择：阻塞并可取消、立即拒绝，或写入可靠外部队列。

### 3. 只限并发：先拿令牌，再启动

```go title="semaphore/main.go"
package main

import (
    "context"
    "fmt"
    "sync"
)

func run(ctx context.Context, jobs []int, limit int) error {
    if limit <= 0 {
        return fmt.Errorf("limit 必须大于 0")
    }
    sem := make(chan struct{}, limit)
    var wg sync.WaitGroup
    defer wg.Wait()
    for _, job := range jobs {
        select {
        case sem <- struct{}{}:
        case <-ctx.Done():
            return ctx.Err()
        }
        if err := ctx.Err(); err != nil {
            <-sem
            return err
        }
        wg.Add(1)
        go func(value int) {
            defer wg.Done()
            defer func() { <-sem }()
            if ctx.Err() != nil {
                return
            }
            fmt.Println(value * value)
        }(job)
    }
    return nil
}

func main() {
    if err := run(context.Background(), []int{1, 2, 3, 4}, 2); err != nil {
        fmt.Println(err)
    }
}
```

输出包含 `1`、`4`、`9`、`16`，顺序不确定。函数返回前等待所有已启动任务结束。这个基础版本只报告提交过程中的取消，不收集任务错误；需要任务错误语义时使用 `errgroup` 或显式结果类型。

**不要先创建几十万个 goroutine，再让每个 goroutine 在内部等令牌。** 那样限制的是正在做事的数量，不是已经创建并占用内存的 goroutine 数量。

## 八、从零编写一个有界 worker pool

先不写复杂的通用 `Pool` 类。对于批次处理，函数级 worker pool 已经能解决真实需求，而且更容易证明它不会泄漏。

### 1. 先写清楚协议

本例处理一批整数：合法数字返回平方，负数返回该项错误，其他项继续处理。

- 固定 `workers` 个消费者，任务队列最多 `queueSize` 个元素。
- 调用方是唯一生产者，也唯一负责关闭任务队列。
- 结果按输入下标保存，每个位置只有一个 worker 写入。
- 正常结束时处理完所有已提交任务，再返回。
- 上下文取消时停止继续生产，worker 尽快退出；允许丢弃未执行的排队任务，本次结果整体不返回。
- 取消不能强制打断处理函数，所以处理函数本身也必须支持取消。

### 2. 完整实现

```go title="worker-pool/main.go"
package main

import (
    "context"
    "errors"
    "fmt"
    "sync"
    "time"
)

type Result struct {
    Value int
    Err   error
}

type job struct {
    index int
    value int
}

func square(ctx context.Context, value int) (int, error) {
    if value < 0 || value > 1000 {
        return 0, fmt.Errorf("数字 %d 不在 0..1000 内", value)
    }
    timer := time.NewTimer(time.Millisecond)
    defer timer.Stop()
    select {
    case <-ctx.Done():
        return 0, ctx.Err()
    case <-timer.C:
        return value * value, nil
    }
}

func RunBatch(ctx context.Context, inputs []int, workers, queueSize int) ([]Result, error) {
    if workers <= 0 || queueSize < 0 {
        return nil, fmt.Errorf("workers 必须大于 0，queueSize 不能小于 0")
    }
    if err := ctx.Err(); err != nil {
        return nil, err
    }
    if len(inputs) == 0 {
        return []Result{}, nil
    }
    if workers > len(inputs) {
        workers = len(inputs)
    }
    jobs := make(chan job, queueSize)
    results := make([]Result, len(inputs))
    var wg sync.WaitGroup
    wg.Add(workers)
    for i := 0; i < workers; i++ {
        go func() {
            defer wg.Done()
            for {
                select {
                case <-ctx.Done():
                    return
                case item, ok := <-jobs:
                    if !ok {
                        return
                    }
                    // 避免取消和取任务同时就绪时继续进入业务处理。
                    if ctx.Err() != nil {
                        return
                    }
                    value, err := square(ctx, item.value)
                    results[item.index] = Result{Value: value, Err: err}
                }
            }
        }()
    }

produce:
    for index, value := range inputs {
        if ctx.Err() != nil {
            break
        }
        select {
        case <-ctx.Done():
            break produce
        case jobs <- job{index: index, value: value}:
        }
    }
    close(jobs)
    wg.Wait()
    if err := ctx.Err(); err != nil {
        return nil, err
    }
    return results, nil
}

func main() {
    results, err := RunBatch(context.Background(), []int{2, -1, 4}, 2, 1)
    if err != nil {
        panic(err)
    }
    for i, result := range results {
        fmt.Printf("任务 %d: value=%d, err=%v\n", i, result.Value, result.Err)
    }
    ctx, cancel := context.WithCancel(context.Background())
    cancel()
    _, err = RunBatch(ctx, []int{1, 2}, 2, 1)
    fmt.Println("已取消:", errors.Is(err, context.Canceled))
}
```

输出的值依次为 `4`、`0`、`16`，第二项带范围错误；最后输出 `已取消: true`。单项业务失败没有取消其他任务，这是本例有意选择的批处理协议。

### 3. 为什么这个实现不会在关闭时互相等待

生产者只向 `jobs` 发送，worker 只接收。生产者结束后关闭 `jobs`，worker 处理剩余任务后看到关闭并退出，`Wait` 才返回。

这里没有结果 channel，因此不会出现“主协程在等 worker 完成，worker 却卡在发送无人接收的结果”这种死锁。如果改用结果通道，必须在 worker 运行时同时消费结果，再由协调者等待所有 worker 后关闭结果通道。

内存并不是全部有界：**任务队列有界，但传入的 `inputs` 和返回的 `results` 仍与总任务数成正比**。百万级或无限流任务应改为分页读取和流式消费结果，不要把所有输入输出一次放进内存。

### 4. 升级为长期服务池时，还要设计什么

| 设计项 | 需要明确的契约 | 常见错误 |
| --- | --- | --- |
| 提交 | 满载时等待、拒绝还是持久化；等待是否可取消 | 无限制创建提交 goroutine，把积压转移到栈上 |
| 关闭 | 谁停止接收新任务，谁关闭队列 | 多个提交者仍在发送时直接 `close` |
| 排空 | 正常停机处理完已接受任务，还是取消未开始任务 | 把“关闭队列”误认为“立即停止” |
| 完成 | 为任务提供结果或完成确认 | `Submit` 成功就当作业务成功 |
| 失败 | 记录业务错误、panic、重试和幂等策略 | 静默吞掉失败 |
| 等待 | 等待所有 worker 退出，并设置服务停机预算 | 没有退出路径或无限等待不合作的任务 |

不要在阻塞发送时持有关闭路径所需的互斥锁，否则关闭和提交可能互相卡住。通用的并发 `Submit/Close` 协议比这个批次池复杂得多：没有明确需求时，保留单生产者所有权模型更稳妥；需要成熟的 worker 生命周期管理时，再选第三方池。

## 九、第三方协程池：ants 的基本使用

`ants` 管理和复用 worker goroutine。它不自动替你收集业务错误、传递 context，也不是持久化任务队列。

### 1. 安装与常用 API

```sh title="ants/setup.sh"
go get github.com/panjf2000/ants/v2@v2.12.1
```

| API | 用途 | 关键注意事项 |
| --- | --- | --- |
| `ants.NewPool(size, options...)` | 创建独立池 | 检查构造错误，业务中显式持有池实例 |
| `pool.Submit(func())` | 提交任务 | 返回的是提交错误，不是任务内部错误 |
| `pool.Release()` | 释放池 | 不等于业务任务全部完成；先做好应用层等待 |
| `ants.WithNonblocking(true)` | 满载时立即返回错误 | 适合明确拒绝过载，必须处理未执行任务 |
| `ants.WithMaxBlockingTasks(n)` | 限制阻塞的提交者数量 | 限的是等待提交者，不是业务任务持久化队列 |
| `ants.WithPanicHandler(handler)` | 自定义 panic 处理 | 必须记录/上报；不会自动把 panic 变成你的业务结果 |
| `pool.Running()` / `pool.Cap()` | 观察 worker 数和容量 | `Running` 是当前 worker 数，不等于精确的正在执行任务数 |
| `pool.ReleaseTimeout(d)` | 在超时预算内释放并等待 worker 退出 | 超时不代表业务任务被强制中断 |
| `pool.Tune(n)` | 调整容量 | 不是通用过载补救；具体限制见所用版本文档 |
| `ants.NewPoolWithFunc` / `Invoke` | 为同一种处理函数提交参数 | 使用前确认参数类型与错误反馈协议 |

### 2. 提交、等待和错误处理

下面使用默认阻塞提交模式：池没有空闲名额时，生产者等待，而不是无限积压新 goroutine。

```go title="ants/main.go"
package main

import (
    "fmt"
    "sync"

    "github.com/panjf2000/ants/v2"
)

type Result struct {
    Value int
    Err   error
}

func main() {
    pool, err := ants.NewPool(2)
    if err != nil {
        panic(err)
    }
    defer pool.Release()

    inputs := []int{2, -1, 4}
    results := make([]Result, len(inputs))
    var wg sync.WaitGroup
    for i, value := range inputs {
        i, value := i, value
        wg.Add(1)
        err := pool.Submit(func() {
            defer wg.Done()
            if value < 0 {
                results[i].Err = fmt.Errorf("不接受负数 %d", value)
                return
            }
            results[i].Value = value * value
        })
        if err != nil {
            // 提交失败意味着任务不会执行，必须撤销计数。
            wg.Done()
            results[i].Err = fmt.Errorf("提交失败: %w", err)
        }
    }
    wg.Wait()
    for i, result := range results {
        fmt.Printf("任务 %d: value=%d, err=%v\n", i, result.Value, result.Err)
    }
}
```

输出结果依次为 `4`、带错误的 `0`、`16`。`wg.Add(1)` 必须发生在提交前，因为任务可能立即执行；提交失败必须补回 `Done`，否则 `Wait` 永远不能结束。

这个算术示例的任务不会预期 panic。真实任务若需要完整的完成状态，必须在任务边界把 panic 记录为明确失败，并保留堆栈；仅仅依赖池的 panic 捕获，可能出现进程没崩但结果字段仍为零值的假成功。

### 3. 满载、取消和死锁边界

- `WithNonblocking(true)` 下，满载可能返回 `ants.ErrPoolOverload`；上例已把提交失败写入结果。服务可返回过载错误或交给可靠队列，不要无休止立即重试。
- 默认 `Submit` 等待没有 context 参数。即使任务闭包捕获了 `ctx`，也不会让等待中的 `Submit` 自动取消。对提交等待有严格超时要求时，优先选择显式支持取消的有界队列协议或非阻塞拒绝。
- 不要再启动一个 goroutine 去包装每个阻塞 `Submit`，那会重新引入无界积压。
- 不要让池内任务阻塞地向同一个已满的池提交子任务并等待：所有 worker 都被父任务占着时，没有 worker 能执行子任务。
- 关闭服务时先停止接受新任务，再等待已接受任务按协议结束，最后释放池。`Release` 不是 `WaitGroup.Wait` 的替代。

::: tip 选型结论

一组有边界的并发调用优先 `errgroup`；有明确队列和流式消费需求时优先固定 worker；经过测量确实需要复用大量 worker 时再考虑 `ants`。不要为了用池而用池。

:::

## 十、进阶模式：流水线、背压与优雅退出

### 1. 流水线与 fan-out / fan-in

以“读取文件 → 解析记录 → 写入数据库”为例：每一阶段只负责一种工作，通过 channel 传递数据。

- **流水线**：不同阶段可以重叠执行，读取下一批时，上一批正在写库。
- **fan-out**：同一阶段由多个 worker 从共同输入通道取任务，提高该阶段处理能力。
- **fan-in**：多个 worker 的结果汇入共同出口，下游统一消费。
- **背压**：下游慢时，有限缓冲逐级填满，上游发送被阻塞，迫使生产速度下降。

实现时把前面的协议应用到每一阶段：发送和接收都支持取消；单发送者关闭自己的输出，多发送者由协调者等待后关闭；某阶段提前退出时取消整条需要停止的流水线。

不要假设 fan-in 保持输入顺序。需要顺序时给任务附上序号，由下游重排，同时限制重排窗口；否则一个慢任务可能让后续结果无限积压。

### 2. 服务退出顺序

1. 停止接收新请求或新任务。
2. 决定排空还是取消：重要且已接受的工作可在预算内排空，允许放弃的任务通知取消。
3. 通知生产者退出，确认不再发送之后由所有者关闭任务队列。
4. 等待 worker 和后台 goroutine 返回。
5. 最后关闭它们依赖的数据库、客户端等资源。

| API | 用途 | 使用边界 |
| --- | --- | --- |
| `signal.NotifyContext` | 将进程信号转换为取消通知 | 常用于根上下文，结束时调用返回的 stop 函数 |
| `http.Server.Shutdown(ctx)` | 停止接受连接并等待活动请求结束 | 不自动管理你另行启动的后台任务或被劫持的连接 |
| `context.WithTimeout` | 给退出等待设置预算 | 停机预算应使用独立、未取消的根上下文派生 |
| `WaitGroup.Wait` / `errgroup.Wait` | 确认任务确实返回 | 本身没有强制终止能力，任务必须合作 |

如果关闭信号已经取消了根上下文，再用这个已取消的上下文派生 `Shutdown` 的超时，通常会立即失败，而不是获得新的排空时间。

请求取消后的邮件、支付通知等可靠后台工作，不能简单用 `go func()` 加 `context.Background()` 解决：进程仍可能重启。需要持久化队列、幂等键和明确的重试协议。

## 十一、线程与进程：是否还需要使用

### 1. 普通 Go 业务通常不直接创建线程

线程始终存在，只是通常由 runtime 管理。Go 不需要像某些语言一样，为了 CPU 并行把业务改成多进程；正常 goroutine 就可以在多个线程、多个 CPU 核心上运行。

runtime 常用 G/M/P 模型来解释调度：G 表示 goroutine，M 表示操作系统线程，P 表示执行 Go 代码所需的调度资源。不要把它理解成“一条 goroutine 永久绑定一个线程”。

网络 I/O 常通过 runtime 网络轮询机制等待；阻塞系统调用和 cgo 调用可能占用线程，但 runtime 可以安排其他线程继续执行可运行的 Go 任务。这不意味着所有阻塞调用都没有线程或资源成本。

| API | 用途 | 什么时候需要 |
| --- | --- | --- |
| `runtime.GOMAXPROCS(0)` | 查看当前 Go 代码并行执行上限 | CPU 任务容量规划、诊断 |
| `runtime.NumGoroutine()` | 查看当前 goroutine 数 | 趋势观测，不作为精确业务任务计数 |
| `runtime.GOMAXPROCS(n)` | 修改并行执行上限 | 有测量依据的运行时调优，不用于业务限流 |
| `runtime.LockOSThread()` | 将当前 goroutine 绑定到当前 OS 线程 | GUI、线程局部状态、部分 C 库等明确要求线程亲和的 API |
| `runtime.UnlockOSThread()` | 解除对应线程绑定 | 与绑定配对，遵守外部库生命周期要求 |

`GOMAXPROCS` 不是 goroutine 数量上限，也不是整个进程的 OS 线程数量上限。Go 1.25 引入容器 CPU 限额感知与动态更新等默认行为；其启用还受语言版本、`GODEBUG` 和显式设置影响。旧版容器部署不要直接假设宿主机逻辑 CPU 数就是实际可用配额。

`LockOSThread` 也不是“创建高性能专用线程”的快捷方式。若外部库要求主线程，可能需要在主 goroutine / 初始化阶段安排线程绑定与事件循环，不能随便启动一个 goroutine 就认为满足要求。一般 HTTP、数据库、文件处理无需调用它。

### 2. 哪些场景应该使用进程

| 场景 | 是否需要多进程 | 原因 |
| --- | --- | --- |
| 并行计算 Go 数据 | 通常不需要 | goroutine 已能利用多核 |
| 调用 FFmpeg、Git 等外部程序 | 需要启动外部进程 | 复用现成工具，而不是重复实现 |
| 不稳定的本地库、不可控任务 | 可以考虑进程隔离 | 子进程崩溃不直接摧毁父进程地址空间 |
| 不可信代码 | 需要更强隔离方案 | 进程只是起点，还需权限、沙箱和资源限制 |
| 独立扩缩容或部署 | 使用多个服务进程 / 容器 | 生命周期和资源预算独立 |
| 跨机器计算 | 多实例 + 网络通信 / 队列 | 单进程 goroutine 不能跨机器运行 |

多进程的代价包括启动、独立内存、序列化和 IPC，以及更复杂的生命周期管理。不要把它当作无成本的并发升级。

### 3. 使用 os/exec 启动外部程序

| API | 用途 | 常见注意事项 |
| --- | --- | --- |
| `exec.CommandContext(ctx, name, args...)` | 创建受 context 控制的命令 | 不自动通过 shell 解释字符串 |
| `cmd.Run()` | 启动并等待完成 | 标准输出是否保存取决于配置 |
| `cmd.CombinedOutput()` | 等待并合并收集 stdout / stderr | 输出保存在内存，大输出需流式写文件或限额 |
| `cmd.Start()` + `cmd.Wait()` | 启动后由调用方稍后等待 | 成功启动后必须等待以回收资源 |
| `cmd.Stdout` / `cmd.Stderr` | 设置输出写入目标 | 可连接文件或受控 writer，避免无限内存积累 |
| `cmd.WaitDelay` | 限制特定退出后管道等待场景 | Go 1.20+；不是通用的进程树超时管理器 |

下面调用本机 Go 工具打印版本，因此只要能运行本文示例，就具备对应命令依赖。

```go title="process/main.go"
package main

import (
    "context"
    "fmt"
    "os/exec"
    "time"
)

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()
    cmd := exec.CommandContext(ctx, "go", "version")
    cmd.WaitDelay = time.Second
    output, err := cmd.CombinedOutput()
    if err != nil {
        fmt.Printf("命令失败: %v；上下文: %v；输出: %s\n", err, ctx.Err(), output)
        return
    }
    fmt.Print(string(output))
}
```

正常输出当前 Go 版本。注意边界：

- 默认取消通常会终止直接启动的子进程，不保证递归清理它创建的所有后代；进程组与作业对象等处理具有平台差异。
- 超时后的命令错误不一定就是 `context.DeadlineExceeded`，同时检查 `ctx.Err()`。
- `exec.CommandContext(ctx, "sh", "-c", userInput)` 会引入 shell 注入风险。优先把程序名与参数分开传递；同时验证业务参数，因为参数本身仍可能改变目标程序行为。
- 父进程与子进程之间不能直接共享普通 Go map 或 channel。使用标准输入输出、文件、socket、RPC 等 IPC。

## 十二、排查并发问题：不要靠加 Sleep 修复

### 1. 常见故障对照表

| 现象 | 常见原因 | 排查或修复方向 |
| --- | --- | --- |
| 偶发错误数据、map 竞争 | 并发读写没有同步 | `-race`，明确共享对象和锁边界 |
| `Wait` 一直不返回 | 少调用 `Done`、任务阻塞、提交失败未撤销计数 | 看 goroutine 堆栈和计数协议 |
| `send on closed channel` | 关闭方与发送方协议错误 | 所有发送结束后才能关闭 |
| goroutine 数持续增长 | 无界启动、发送无人消费、不支持取消的等待 | 限制入口，给每个阻塞点设计退出路径 |
| CPU 空闲却延迟高 | 锁竞争、队列等待、下游阻塞 | 查看阻塞与互斥锁 profile、下游延迟 |
| CPU 高但没做业务 | `select default` 忙等、重复读取关闭通道 | 移除忙等，关闭后退出或禁用分支 |
| 加协程池反而更慢 | 任务太小、排队/调度开销、共享锁热点 | 测量后减少并发或改为批量处理 |
| 程序直接崩溃 | 某个 goroutine 未恢复的 panic | 在合适任务边界处理并记录堆栈，不要静默吞掉 |

`recover` 只能在发生 panic 的同一 goroutine 的延迟调用中生效；父 goroutine 的 `defer recover` 抓不到子 goroutine 的 panic。`errgroup` 也不会替你把 panic 转成 error。

runtime 的全局死锁报错只能发现部分情况。一个 HTTP 服务可能还有网络 goroutine 存活，而你的某条业务请求已经永久等待，因此“没有 deadlock 报错”不代表没有死锁。

### 2. 工具与观测

| 工具 / API | 用途 | 注意事项 |
| --- | --- | --- |
| `go test -race ./...` / `go run -race .` | 查找执行路径中的数据竞争 | 不是死锁、泄漏或业务顺序错误的通用检测器 |
| `go vet ./...` | 静态发现部分错误 | 检查能力受 Go 版本影响，例如 Go 1.25 增加 WaitGroup 检查 |
| `runtime/pprof` / `net/http/pprof` | goroutine、CPU、内存、锁与阻塞分析 | 诊断接口仅对受控网络开放 |
| `go tool pprof` | 分析 profile | 对比压测前后，定位实际热点 |
| `runtime/trace` / `go tool trace` | 查看调度、阻塞、系统调用等时序 | 采集有成本，控制时长与数据大小 |
| `runtime.SetBlockProfileRate` / `SetMutexProfileFraction` | 开启阻塞 / 锁竞争采样 | 默认不一定采样，按诊断需要设置 |

建议至少记录：活跃任务数、队列长度、提交等待时间、执行耗时、超时率、拒绝数、错误率，以及 goroutine 数、内存和下游连接使用率。队列长度低不一定健康，也可能任务全阻塞在下游。

### 3. 并发测试应该验证什么

- 成功：每项结果正确，执行上限没有被突破，需要时保持结果顺序。
- 失败：某项错误是取消整批还是保留逐项结果，与协议一致。
- 取消：提交等待、执行中等待和结果发送都能退出，调用方确实等待清理完成。
- 关闭：最后一个发送完成后才关闭，不丢失承诺完成的任务。
- 过载：拒绝或阻塞符合预期，拒绝的任务不会偷偷执行。

测试用通道和屏障控制时序，不用固定 `Sleep` 猜“另一个任务应该开始了”。对可能卡住的测试设置总超时；检查实际行为，不断言系统 goroutine 总数恰好等于某个常量。

## 十三、循序渐进练习与工作检查清单

### 1. 四个练习

| 阶段 | 练习 | 验收标准 |
| --- | --- | --- |
| 基础 | 并发计算 10 个整数的平方 | 主函数等待完成；结果按输入顺序输出；race 检查通过 |
| 协作 | 实现可取消的生产者和消费者 | 消费者提前退出时生产者也能结束，不阻塞在发送上 |
| 工程 | 基于 `fetchAll` 增加一个慢接口 | 总超时能传到 HTTP 请求；全部子任务退出后才返回 |
| 池化 | 为 `RunBatch` 编写满队列取消测试，再比较 ants 非阻塞模式 | 取消不泄漏；拒绝任务有明确错误；并发数不超过约定 |

### 2. 写下 `go` 之前，回答这些问题

1. 谁拥有这个任务，谁等待它完成？
2. 最晚什么时候结束？取消是否传到了真正的阻塞操作？
3. 输入是否共享，结果由谁写，是否有并发读写？
4. 同时可以执行多少个，最多可以排队多少个？
5. 下游超时、返回错误或发生 panic 时，调用方如何得知？
6. 服务退出时，是排空、取消还是把工作交给可靠队列？
7. 是否真的测量到需要协程池，而不是先添加复杂度？

掌握这些问题，比记住某个池的构造函数更重要：**可用于工作的并发代码，不仅要能启动任务，还要能限制、等待、取消、观测和正确退出。**

## 参考资料

- [Go 语言规范：go 语句、channel 与 select](https://go.dev/ref/spec)
- [Go 内存模型](https://go.dev/ref/mem)
- [sync 标准库](https://pkg.go.dev/sync) 与 [context 标准库](https://pkg.go.dev/context)
- [Go 官方：并发流水线与取消](https://go.dev/blog/pipelines)
- [errgroup 文档](https://pkg.go.dev/golang.org/x/sync/errgroup)
- [ants v2.12.1 源码与使用说明](https://github.com/panjf2000/ants/tree/v2.12.1)
- [os/exec 标准库](https://pkg.go.dev/os/exec)
- [Go 数据竞争检测器](https://go.dev/doc/articles/race_detector)
- [Go 1.22 循环变量变更](https://go.dev/doc/go1.22#language)
- [Go 1.25 发布说明：WaitGroup.Go 与容器感知调度](https://go.dev/doc/go1.25)
