---
title: Rust使用记录 
createTime: 2026/01/11 09:34:22
permalink: /blog/j5pnmu6v/
tags:
  - rust
---

> [!TIP]
> 文档作为使用 `rust` 进行开发时的问题记录，并非完整的教学，比较碎片化

## 基础使用中的注意事项

### 单引号和双引号的区别
在创建字符串（字符串切片）时，使用单引号表示的是 `Char` ，当某些需要投递 `Char` 数据时，必须使用单引号的形式，而且只能输入一个字符，比如 `'q'` ，表示 `Char` 字符 `q`

## DOC 注释

### 编写注释

- 所有文件都为一个模块，文件顶部使用 `//!` 进行注释，作为模块的主要说明
- 公开的结构体、字段、函数等，使用 `///` 进行注释
- 在注释中，可以添加示例代码，示例代码在使用 `cargo test` 时会自动执行，如果不想执行，则需要指定 `no_run` 、`ignore` 等
  - 注释中使用 `# Example` 作为标记，写入代码块则默认在 `cargo test` 时执行
  - 代码块标识后加 `no_run` 时，表示不运行，但是会编译，查看示例代码是否有效
  - 使用 `ignore` 时，代码不会执行也不会编译，主要用于不能执行的示例说明

`````

//! # Example
//!
//! ```
//! <code> 未标记代码类型，默认为 rust
//! ```
//!
//! ```no_run
//! 
//! ```
//! 
//! ```ignore
//! 
//! ```
//! 
`````

- `doc` 注释不能写在 `impl` 上，需要放在具体的对象上，比如放在结构体，`impl` 应该只聚焦具体的方法
- 如果不是 `pub` 的字段，进行 `doc` 标注也不会显示

### 生成注释

```bash title="bash.sh"
# 生成文档并打开，这种方式连带里面的依赖也会生成进来，会非常大，一般使用无依赖的形式
cargo doc --open

# 生成文档并打开，但是不包含依赖的三方包
cargo doc --no-deps --open
```

## Option/Result 相关

### map 和 and_then

`map` 和 `and_then` 都是对 `Option` 执行某些操作并且返回，假如 `map` 和 `and_then` 使用的同一个函数，如果这个函数返回的是一个普通值，可以使用 `map` ，如果返回的
是另一个 `Option` 值，则使用 `and_then` ，可以扁平化嵌套的 `Option`，如果使用 `map` ，可能还需要在后面的链式操作中，使用 `flatten` 进行扁平化处理

## 实现某些常用 trait

实现某些 `trait` ，很多可以直接使用派生宏，如果比较复杂，则使用 `impl` 来进行手动实现，比如这里为结构体实现 `Default` 

```rust
// 直接派生
#[derive(Default)]
struct A {
  name: String
}

// 手动构造
impl Default for A {
  fn default() -> Self {
    Self {name: String::new()}
  }
}
```

比较常见的 `trait`

- `Clone` : 深拷贝，一般直接使用派生即可，如果复杂则需要手动实现
- `Copy` : 按位复制，只能用在栈上数据，不会移动数据，比如 `String`、`Vec` 等就不能用，一般基础类型等实现了 `Copy` 方法，可直接派生，复杂需手动实现，但是一般不会人工去实现 `Copy`
- `Debug` : 用于使用类似 `{:?}` 或 `{:#?}` 进行调试输出，直接派生即可
- `Display` : 需要手动实现 `impl` ，去实现 `to_string` 的方法
- `Default` : 为结构体等实现 `default`，之后可以使用 `<结构体>::default()` 创建带默认值的实例
- `PartialEq, Eq` : 是否相等
- `PartialOrd, Ord` : 比较大小的方法
- `FromStr` : 为枚举等实现 `from_str` 的方法，当然还有 `From<T>` 之类的，这看名称则知道是 `from` 方法，对于枚举，如果使用的比较多，可以加入 `strum` 包，里面增加了很多针对枚举的功能，比如实现字符串枚举之类的
- `From<T>` : 安全的从 `T` 类型转换到当前类型，需要手动 `impl` 实现，实现可获得 `into()` 方法，所以一般也不会去实现 `Into<T>` 这个
- `Iterator` : 支持 `map`、循环、`filter` 等，需要手动实现 `next()` 方法

## 异步 trait 实现

当你的 `trait` 中包含异步方法时，你需要使用 `async_trait` 来进行构造，至于为什么异步 `trait` 实现会这么麻烦，可以参照[这个说明](https://smallcultfollowing.com/babysteps/blog/2019/10/26/async-fn-in-traits-are-hard/)

使用 `cargo add async_trait` 安装后，在你的 `trait` 和 `impl` 上使用宏 `#[async_trait]`

## 单元测试

单元测试一般写在当前测试的文件底部，写法如：

```rust
#[cfg(test)]
mod tests {
  use super::*

  #[test]
  fn test_case() {

  }
}
```

如果要测试异步任务，需要使用 `tokio::test`

```rust
#[cfg(test)]
mod tests {
  use super::*

  #[tokio::test]
  async fn test_case() {

  }
}

```

使用 `#[ignore]` 可忽略当前用例，除非指定运行，对于某些 `CI` 不想自动执行可以加上，比如测试依赖某个环境变量之类的

```rust
#[cfg(test)]
mod tests {
  use super::*

  #[tokio::test]
  #[ignore]
  async fn test_case() {

  }
}

```

### 执行单元测试

执行单元测试使用命令 `cargo test`，可以通过 `cargo help test` 查看更多文档

==默认 `cargo test` 不会显示 `Println!()` 之类的数据，需要执行时加上 `--no-capture` 才会显示==

手动指定的话，需要从模块开始往下找，比如

```bash title="test.sh"
cargo test <mod1>::<mod2>::<mod3>::test_case
```

### 测试实现 trait 的结构体方法

==在 `impl` 实现某个 `trait` 时，不能使用 `pub` 前缀==，是否开放根据 `trait` 的结果来，不能 `pub` 则不能直接进行单元测试（因为需要使用 `use super::*` 之类的获取上级模块函数）

- 直接通过集成测试，在 `test` 文件夹中编写
- 先实现结构体的方法，可同名，然后再写一个 `impl <trait> for <struct>` ，里面的实现直接调用结构体已实现的方法，这样则不影响


## 关于如何查找锁定 Feature

你可以通过下面几种方式找到 `feature`

- 在 `docs.rs` 文档的 `feature tag` 中找到所有
- 在项目源码的 `Cargo.toml` 文件中，找到 `[feature]` 标记下的

怎么确定你需要使用什么 `feature` 呢？一般是在 `docs.rs` 中去看，你使用的某些函数、结构体等，后面会有黄色的小标签，提示这个属于什么 `feature` ，特殊的 `feature` 注意：

- `default` : 这个 `feature` 是用来包含默认的，你直接使用 `cargo add` ，但是不指定 `-F/--feature` 时，会安装默认的，在 `docs.rs` 的 `feature tag` 或者 `Cargo.toml` 可以看到
- 如果不想要 `default` 的 `feature` ，完全自己控制，则通过在 `Cargo.toml` 依赖中加上 `default-features = false` 来取消安装 `default` 的依赖
- 如果查找当前的依赖，可以使用 `cargo tree` 来查看，`cargo tree -i tokio` 查看关于 `tokio` 这个使用这个包的依赖，使用 `cargo tree -e features -i tokio` 还可以显示出所有 `feature` 名称，但是很难看清楚，直接看 `docs.rs` 更好

## 如何缩小编译体积

针对编译的配置，在 `Cargo.toml` 的 `[profile.release]` 下，这是使用 `cargo build --release` 的配置数据，缩小体积可以使用下面的一些

```toml
[profile.release]
// 开启后生成无调试符号的二进制，即不能再进行调试操作
strip = true

// 启用链接时优化
// 使用 true 全程序 LTO，跨 crate 优化，大幅减小体积并提升性能
// 使用 thin ，轻量级 LTO，编译更快，体积缩减略少但仍有显著效果
// 启用后编译时间会显著增加，对于某些动态链接场景可能会受影响
lto = true

// 禁用 panic unwind
// 默认panic会进行栈资源清理等，获取panic信息，使用 `abort` 则直接退出
panic = "abort"

// 可以使用 `s` 或者 `z` ，优化体积，使用的 LLVM 的 `-Oz`，使用 `z` 会比 `s` 更激进，一般使用 `s` 也够了
opt-level = "s"

// 减少并行编译单元，牺牲编译速度获取更优的跨函数优化，开启后编译会非常慢，但体积也会更小
codegen-units = 1

```

其他较小体积的提示：

- 精简 `feature` ，不要使用过多冗余的，比如很多时候，使用 `tokio` 直接使用 `full`
- 使用 `UPX` 进行压缩，但一般不推荐，运行时解压可能会报毒，启动多了解压更慢，没办法全平台通用，比如 `macOS` 不能用
