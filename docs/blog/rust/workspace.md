---
title: Workspace配置与使用
createTime: 2026/03/21 08:23:12
permalink: /blog/bbet581k/
tags:
  - rust
---

> [!tip]
> 使用 `workspace` 的方式，可以构建类似 `monorepo` 的结构，可以在项目中包含多个 `crates` 之类的，这些 `crates` 也可以拿来作为单独包发布

> [!note]
> `uv` 的 `workspace` 也借鉴的此方式，了解了这个的使用，在使用 `uv` 的 `workspace` 会更加容易理解

## 创建Workspace项目

### 创建项目结构

`workspace` 项目和普通项目没有什么区别，我们可以直接创建一个 `src` 项目

```bash
cargo new rust-workspace
```

然后我们在 `Cargo.toml` 中可以看到这样的配置：

```toml
[package]
name = "rust-workspace"
version = "0.1.0"
edition = "2024"

[dependencies]
```
我们在根目录下，创建一个 `crates` 文件夹，用于存放一些内部使用的 `crates`，下面创建一个 `utils` 文件夹用于测试，这个 `utils` 是一个 `lib` 项目，可以自己创建文件夹然后创建 `Cargo.toml` ，也可以在 `crates` 下使用 `cargo new --name utils crates/utils --lib` 然后删除 `READMD.md` 、`.git` 、`target` 等文件夹和文件

我们现在的项目结构如下：

```
rust-workspace
├── Cargo.lock
├── Cargo.toml          // 根目录配置文件
├── crates              // 存放各种 crates 的地方
│   └── utils
│       ├── Cargo.toml  // utils 的配置文件
│       └── src
│           └── lib.rs
└── src
    └── main.rs
```

### 修改配置
我们需要将根目录的 `Cargo.toml` 改成如下的形式，添加 `workspace` 相关，字段在下面代码快中说明：

```toml
[workspace]
members = ["crates/utils"] // 指定workspace下有哪些成员

[workspace.package] // workspace 的包说明
edition = "2024"
version = "0.1.0"

[workspace.dependencies] // workspace 的依赖
utils = { path = "crates/utils" }   // 指定需要 utils 这个 crate

[package]     // 这里使用 {workspace = true} 直接继承 workspace 配置的参数
name = "rust-workspace"
version.workspace = true
edition.workspace = true

[dependencies]    // 继承 workspace 添加的项目依赖版本
utils = {workspace = true}
```

这样我们的项目就是一个 `workspace` 项目了，接下来 `utils` 也需要更改，直接继承根目录的 `workspace` 数据，保持整体统一

在 `crates/utils` 的 `Cargo.toml` 中编写如下配置

```toml
[package]
name = "utils"
version.workspace = true // 从 workspace 继承
edition.workspace = true // 从 workspace 继承

[dependencies] // 依赖可以从 workspace 继承，也可以添加自己的独有依赖
```
