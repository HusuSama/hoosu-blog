---
title: OpenSSL 日常使用手册：安装、证书、密钥与签名命令速查
createTime: 2026/10/10 19:15:00
tags:
  - OpenSSL
  - 安全
  - 命令行
permalink: /blog/mon19sbt/
---

## 先分清 OpenSSL、SSH 与本文版本

**本文以社区 OpenSSL 3.5 LTS 的命令行工具为基准，使用默认 provider，参考版本为 OpenSSL 3.5.9（2026-09-29 发布）**。资料核对日期为 2026-10-10；3.5 LTS 的社区支持期截至 2030-04-08。补丁版本应跟随安全更新，3.5.9 是本文的参考版本，不表示以后应固定安装它。

这里说的类型是 **OpenSSL 项目的正式发行版**，不是 LibreSSL，也不是某台电脑预装的版本。包管理器可能提供其他受维护分支，下面会标出主要差异。命令语法以 [OpenSSL 3.5 官方手册](https://docs.openssl.org/3.5/man1/openssl/) 为准；本文不把本地可执行文件的行为当作社区标准。

| 对比项 | OpenSSL / `openssl` | SSH / OpenSSH |
| :-- | :-- | :-- |
| 是什么 | 密码学库与命令行工具，包含 TLS、证书、密钥、摘要、签名等能力 | SSH 是安全远程连接协议；OpenSSH 是常见实现，提供 `ssh`、`ssh-keygen`、`scp` 等工具 |
| 日常用途 | 查 HTTPS 证书、诊断 TLS、生成密钥、签名验签、转换证书 | 登录服务器、执行远程命令、建立隧道、传输文件 |
| 身份材料 | 常用 X.509 证书、PKCS#8 私钥、SPKI 公钥 | 常用 OpenSSH 私钥、`authorized_keys` 公钥；也有自己的 SSH 证书体系 |
| 都有 Ed25519 / RSA，能否直接互换 | 算法相同不代表文件格式相同，不能把 PEM 公钥直接贴进 `authorized_keys` | `ssh-ed25519 AAAA...` 不是 OpenSSL 的 `BEGIN PUBLIC KEY`；转换要确认算法与格式支持 |
| 应该选哪个 | HTTPS/TLS、程序授权签名：用 OpenSSL 或对应语言的密码学库 | 服务器登录密钥：用 `ssh-keygen`；远程登录：用 `ssh` |

签名授权的完整案例见 [用签名认证给程序加「使用期限」：Python / Go / Rust 实战](/blog/i1n48jnb/)。本篇负责解释其中 OpenSSL 命令的含义，并补充通用日常操作。

### 其他版本可能有哪些不一致

| 实现 / 版本 | 本文中需要注意的区别 |
| :-- | :-- |
| OpenSSL 3.5.x LTS | 本文基准；provider 配置、构建选项也会影响可用算法 |
| OpenSSL 3.0～3.4 | 大多数核心示例可用；Ed25519 的 `pkeyutl` 签名必须显式写 `-rawin`，本文保留它；后量子算法不是这些版本的通用能力 |
| OpenSSL 3.6 / 4.x | 不属于本文基准；已有命令多有兼容性，但默认值、算法与选项应查对应版本手册 |
| OpenSSL 1.1.1 | 已结束社区支持；能生成 Ed25519 密钥，但其 `pkeyutl` **不支持 Ed25519 签名验签**；没有 3.x 的 provider 参数；`-noenc` 需按子命令改成旧参数 `-nodes` |
| OpenSSL 1.0.2 及更早 | 不支持 Ed25519；不要依赖本文的现代命令；优先升级 |
| LibreSSL / BoringSSL | 是不同项目；即使命令也叫 `openssl`，选项与算法覆盖也不保证一致 |
| 发行版补丁 / FIPS 配置 | 发行版可能继续维护社区已停止支持的分支；是否合规、算法是否可用，要结合发行版公告和实际加载的 provider 判断 |

以上描述的是社区生命周期，不代替发行版或商业延长支持承诺。当前版本与支持时间见 [官方发布页](https://openssl-library.org/source/)。

## 安装与环境确认

### 各系统安装

包管理器安装的是其仓库当前提供的版本，**不会因为运行下面的命令就必然得到 3.5 LTS**。安装完成后先确认版本；需要严格复现 3.5 时，选择提供该分支的软件包或按官方源码安装到独立目录。

| 系统 | 常用渠道 | 注意事项 |
| :-- | :-- | :-- |
| Ubuntu / Debian / WSL Ubuntu | `apt` | 版本由发行版决定；WSL 内按 Linux 使用 |
| macOS | Homebrew `openssl@3` | 该配方可能跟随其他 3.x 分支；一些系统自带的是 LibreSSL；不要覆盖 `/usr/bin/openssl` |
| Fedora / RHEL / Rocky / AlmaLinux | `dnf` | 企业发行版有自己的补丁与安全策略 |
| Arch Linux | `pacman` | 滚动发行可能升级到新的主版本 |
| Alpine Linux | `apk` | 精简镜像需要另装 CA 证书包 |
| Windows | WinGet / 社区安装包 / WSL | OpenSSL 项目不直接提供官方 Windows 安装包；社区构建与 OpenSSL 项目是不同维护方 |

```sh title="install-linux.sh"
# Ubuntu / Debian / WSL Ubuntu
sudo apt update
sudo apt install openssl ca-certificates

# Fedora / RHEL 系
sudo dnf install openssl ca-certificates

# Arch Linux
sudo pacman -S openssl ca-certificates

# Alpine Linux
sudo apk add openssl ca-certificates
```

以上是四个系统的独立方案，只执行自己系统对应的一组。

```sh title="install-macos.sh"
brew install openssl@3

# 当前终端优先使用 Homebrew 版本；兼容 Apple Silicon 与 Intel 的前缀
export PATH="$(brew --prefix openssl@3)/bin:$PATH"
openssl version -a
```

需要持久生效时，把 `export` 这一行加入自己使用的 shell 配置，如 `~/.zshrc`。先安装 [Homebrew](https://brew.sh/)，再使用上面的命令。

```powershell title="install-windows.ps1"
# 先查看当前目录中的发行者、包信息与可用版本
winget search OpenSSL
winget show --id ShiningLight.OpenSSL.Light --exact

# 社区发行包；Light 版本适合只使用命令行工具的场景
winget install --id ShiningLight.OpenSSL.Light --exact

# 安装后重开终端；如果安装器没有配置 PATH，按实际安装路径添加 bin 目录
Get-Command openssl -All
openssl version -a
```

包标识与可用版本可能改变；WinGet 无法找到时，按 [OpenSSL 社区二进制发行说明](https://openssl-library.org/community/binaries/) 选择维护方。安装成功但 `Get-Command` 找不到时，可以先用完整路径调用，例如 `& 'C:\Program Files\OpenSSL-Win64\bin\openssl.exe' version -a`，路径以安装器实际结果为准。需要后文的 POSIX shell 管道时，可在 WSL 中执行。

### 第一次使用先检查这些

```sh title="check-environment.sh"
# OpenSSL 身份、版本、构建配置、配置目录与模块目录
openssl version -a

# Linux / macOS：看看 PATH 中命中了谁，是否有多个版本
type -a openssl

# 查看子命令与各子命令帮助
openssl help
openssl x509 -help
openssl genpkey -help

# OpenSSL 3.x：查看已加载的 provider 与可用算法
openssl list -providers
openssl list -public-key-algorithms
openssl list -digest-algorithms
openssl list -cipher-algorithms
```

`openssl help` 列出的是子命令；`ED25519`、`RSA` 是 `genpkey -algorithm` 的值，不是单独的子命令。`list` 输出也可能包含别名与不同 provider 的实现；要确认某个算法确实能用于当前操作，实际生成或读取一次更可靠。

## 复制前先约定输入、输出与 shell

命令基本形态是 `openssl 子命令 参数 输入`，例如 `openssl x509 -in cert.pem -noout -dates`。**参数属于子命令**：同一个 `-in`、`-key`、`-pass` 在不同子命令里的用途不能凭名字推断。

后文按开发、运维日常场景的经验频率排序：先证书与 TLS 排障，再摘要、随机数、编码、密钥、签名、CSR、格式打包与加密。这是阅读顺序，不是采集得到的使用统计。每节参数表也按该场景通常的使用频率由高到低排列。

- `cert.pem`、`private.pem`、`public.pem`、`input.txt` 是工作目录中的文件；需要先准备输入。生成类示例用不同文件名，避免串用不同算法的密钥。
- `-out` 指定的文件通常会被覆盖；复制前检查文件名。私钥不要进入 Git、日志或交付物。
- 单条 `openssl ...` 命令通常也能在 PowerShell 使用；以 `sh` 标记的 `\` 续行、`$(...)`、`printf`、`< /dev/null`、`umask`、管道外部工具按 POSIX shell 编写。
- PowerShell 可把多行命令合成一行；二进制数据用 `-in` / `-out` 传递，避免依赖不同 PowerShell 版本的管道编码。
- 需要口令时，默认让 OpenSSL 交互提示；自动化口令来源见后文。示例没有把真实口令硬写进命令行。

## 1. 查看证书：内容、期限、指纹与公钥

```sh title="inspect-certificate.sh"
# 最常用：签发给谁、谁签发、什么时候过期
openssl x509 -in cert.pem -noout -subject -issuer -dates

# 查看完整内容：算法、公钥、扩展、SAN 等
openssl x509 -in cert.pem -noout -text

# 查看域名列表；HTTPS 域名匹配主要看 SAN，不只看 CN
openssl x509 -in cert.pem -noout -ext subjectAltName

# SHA-256 证书指纹；不同于公钥指纹
openssl x509 -in cert.pem -noout -fingerprint -sha256

# 检查是否会在未来 30 天内到期：0 = 不会，非 0 = 将到期或检查出错
openssl x509 -in cert.pem -noout -checkend 2592000

# 从证书导出 SPKI 公钥
openssl x509 -in cert.pem -pubkey -noout -out cert-public.pem
```

`-checkend` 只检查到期时间，不验证信任链、域名，也不代替对生效时间的检查。脚本中遇到非零返回值应同时查看错误输出。

| 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-in` | 文件路径 | 读取证书；默认 PEM |
| `-noout` | 开关 | 不再输出证书编码，只输出要求的信息 |
| `-dates` | 开关 | 显示 `notBefore`、`notAfter` |
| `-subject` / `-issuer` | 开关 | 显示主题 / 签发者 |
| `-text` | 开关 | 人类可读的详细内容 |
| `-ext` | `subjectAltName`、`keyUsage`、`extendedKeyUsage` | 按扩展名查看，可用逗号分隔 |
| `-fingerprint` + `-sha256` | 开关 / 摘要算法 | 计算整个证书的 SHA-256 指纹 |
| `-checkend` | 秒数，非负整数 | `0` 检查当前是否已到期；`86400` 一天；`2592000` 三十天 |
| `-serial` | 开关 | 查看序列号 |
| `-pubkey` | 开关 | 输出公钥；可与 `-noout` 配合 |
| `-out` | 文件路径 | 输出到文件 |
| `-inform` / `-outform` | `PEM`、`DER` | 输入 / 输出编码，见格式一节 |
| `-nameopt` | 如 `RFC2253` | 控制主题与签发者名称的显示形式 |

## 2. 诊断 HTTPS / TLS：连接、SNI 与验证

```sh title="check-tls.sh"
# 验证证书链与域名，失败时中止；替换两处 example.com
openssl s_client -connect example.com:443 -servername example.com \
  -verify_hostname example.com -verify_return_error -brief < /dev/null

# 查看服务端实际发送的证书链
openssl s_client -connect example.com:443 -servername example.com \
  -showcerts < /dev/null

# 私有 CA：显式指定你信任的根证书
openssl s_client -connect example.com:443 -servername example.com \
  -verify_hostname example.com -verify_return_error -CAfile root-ca.pem < /dev/null

# 只测试 TLS 1.2 / TLS 1.3 是否可以握手
openssl s_client -connect example.com:443 -servername example.com -tls1_2 -brief < /dev/null
openssl s_client -connect example.com:443 -servername example.com -tls1_3 -brief < /dev/null

# SMTP 的 STARTTLS；这不是直接连接 HTTPS
openssl s_client -connect smtp.example.com:587 -starttls smtp \
  -servername smtp.example.com -verify_hostname smtp.example.com \
  -verify_return_error < /dev/null
```

`-servername` 发送 SNI，决定服务器选择哪个站点的证书；`-verify_hostname` 才检查证书是否匹配域名。`s_client` 是诊断工具，默认可能打印验证错误后仍继续连接，因此正式检查要显式加 `-verify_return_error`。

`-showcerts` 显示的是**服务端发送的证书**，不是已经成功验证的链；通常不包含根证书。默认 CA 路径随构建与发行版变化，Windows / macOS 的 OpenSSL 也不保证直接使用系统或浏览器的信任库。遇到 `unable to get local issuer certificate`，先检查服务端中间证书是否完整、本地 CA 包是否安装，再按需使用来自可信渠道的 `-CAfile`。

| 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-connect` | `域名:端口`、`IP:端口` | 连接目标，HTTPS 通常为 `443` |
| `-servername` | DNS 名称 | 发送 SNI；连接 IP 时尤其要明确写出 |
| `-verify_hostname` | DNS 名称 | 验证证书域名；IP 匹配改用 `-verify_ip` |
| `-verify_return_error` | 开关 | 证书验证失败时终止握手 |
| `-showcerts` | 开关 | 打印服务端发送的全部证书 |
| `-brief` | 开关 | 精简显示协议、套件等结果 |
| `-CAfile` / `-CApath` | CA 文件 / 哈希索引目录 | 指定信任根；目录通常需先执行 `openssl rehash` |
| `-tls1_2` / `-tls1_3` | 开关 | 强制某个协议版本，用于定位问题 |
| `-starttls` | `smtp`、`imap`、`pop3`、`ldap`、`postgres` 等 | 先进行相应应用协议协商，再升级到 TLS |
| `-alpn` | 如 `h2,http/1.1` | 提供应用层协议列表 |
| `-cert` / `-key` | 客户端证书 / 私钥路径 | 双向 TLS；链可用 `-cert_chain` 补充 |
| `-cipher` | TLS 1.2 及以下套件列表 | 不控制 TLS 1.3 的套件 |
| `-ciphersuites` | 如 `TLS_AES_128_GCM_SHA256` | 控制 TLS 1.3 套件，多个值用冒号分隔 |

### 离线验证证书链

```sh title="verify-certificate.sh"
# 根证书是信任锚；中间证书只帮助构建链，不自动成为信任锚
openssl verify -CAfile root-ca.pem -untrusted intermediates.pem \
  -purpose sslserver -verify_hostname example.com cert.pem
```

`verify` 的 `-CAfile` 放信任根，`-untrusted` 放中间证书，最后的 `cert.pem` 是待验证的叶子证书。常用 `-purpose` 为 `sslserver`、`sslclient`；成功通常输出 `cert.pem: OK` 并返回 0。这条命令不自动完成在线吊销状态检查。

## 3. 文件摘要与 HMAC

```sh title="digest.sh"
# 校验文件字节的 SHA-256
openssl dgst -sha256 input.txt

# SHA-512；需要与对接方的算法保持一致
openssl dgst -sha512 input.txt

# 输出原始二进制摘要，而不是文本十六进制
openssl dgst -sha256 -binary -out input.sha256.bin input.txt

# 用演示用的十六进制密钥计算 HMAC-SHA256；真实密钥不要写进 shell 历史
openssl dgst -sha256 -mac HMAC -macopt hexkey:00112233445566778899aabbccddeeff input.txt
```

摘要没有密钥，只能在预期摘要可信时用于完整性校验。HMAC 使用共享密钥，双方都能生成，不能提供公私钥签名那种独立验证能力。**Base64 不是摘要，摘要也不是加密**。

| 参数 / 类型 | 常用值 | 说明 |
| :-- | :-- | :-- |
| 摘要选择 | `-sha256`、`-sha512`、`-sha384`、`-sha3-256` | SHA-256 最常用；默认值也建议显式写出 |
| 文件参数 | 一个或多个文件路径 | `dgst` 常把文件放在命令末尾，不使用 `-in` |
| `-out` | 文件路径 | 保存结果 |
| `-binary` / `-hex` | 开关 | 原始字节 / 十六进制显示；默认通常为文本十六进制 |
| `-mac` | `HMAC` | 指定消息认证码算法 |
| `-macopt` | `hexkey:十六进制`、`key:文本` | 设置 MAC 参数，可重复；注意命令行密钥暴露问题 |
| `-hmac` | 文本密钥 | HMAC 的简写形式，同样会把密钥放入进程参数 |
| 旧摘要 | `-md5`、`-sha1` | 仅用于兼容既有校验结果，不用于新签名与抗碰撞需求 |

## 4. 生成随机 token、口令材料与二进制密钥

```sh title="random.sh"
# 32 个随机字节 -> 64 个十六进制字符，适合常见 token 场景
openssl rand -hex 32

# 32 个随机字节 -> Base64；可能包含 +、/、=，不是 Base64URL
openssl rand -base64 32

# 32 字节原始随机数据；不要把二进制内容直接输出到终端
openssl rand -out secret.bin 32
```

| 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| 末尾长度 | `16`、`32`、`64`，字节数 | `16` 为 128 位随机数据，`32` 为 256 位；不是输出字符数 |
| `-hex` | 开关 | 每字节变成 2 个十六进制字符 |
| `-base64` | 开关 | Base64 文本；长度约为 `4 × ceil(字节数 / 3)`，另有换行 |
| `-out` | 文件路径 | 保存原始字节或编码后的结果 |

随机输出也可能是秘密。应用的 token 长度、字符集和有效期仍需按接口要求设计。

## 5. Base64 编码与解码

```sh title="base64.sh"
# 单行编码：适合 JSON 字段或配置项
openssl base64 -A -in input.txt -out input.b64

# 对应单行解码，二进制输出也安全地写入文件
openssl base64 -d -A -in input.b64 -out decoded.bin

# 默认的多行 Base64：与单行方案分开使用
openssl base64 -in input.txt -out input.multiline.b64
openssl base64 -d -in input.multiline.b64 -out decoded-multiline.bin
```

| 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-in` / `-out` | 文件路径 | 读取原始内容 / 保存结果 |
| `-d` | 开关 | 解码，省略则编码 |
| `-A` | 开关 | 按单行处理；单行方案的编解码配对使用 |
| `-e` | 开关 | 显式编码，通常可省略 |

标准 Base64 与 JWT 使用的 Base64URL 不相同。后者会替换 `+`、`/`，通常移除 `=`；不要直接把上述结果当作 JWT 段。中文、换行、编码都是被处理的字节，签名前后必须完全一致。

## 6. 密钥：算法、文件格式、生成与检查

### key 的含义与常用类型

这里的 `key` 可能是非对称私钥 / 公钥，也可能是 AES、HMAC 使用的对称秘密，不能只凭 `.key` 后缀判断。

| 顺序 | key 类型 | 日常用途 | 常用选择 / 尺寸 | 边界 |
| :-- | :-- | :-- | :-- | :-- |
| 1 | RSA 私钥 / 公钥 | 既有 TLS、接口签名、跨系统兼容 | 新密钥常选 3072 位；2048 位仍常见，按系统策略选择 | 签名与加密使用不同填充；不直接加密大文件 |
| 2 | EC 私钥 / 公钥 | TLS 证书、ECDSA 签名、ECDH 协商 | `P-256`（`prime256v1`）、`P-384`（`secp384r1`） | 需要协商曲线与摘要；不是 Ed25519 |
| 3 | Ed25519 私钥 / 公钥 | 程序授权、现代签名方案 | 公钥原始值 32 字节，签名 64 字节 | 只签名验签，不做加密或密钥协商；本文授权示例优先用它 |
| 4 | 对称 key | AES 加密、HMAC、API 共享秘密 | AES-128 为 16 字节、AES-256 为 32 字节；HMAC 常用随机 32 字节 | 双方持有同一秘密，没有可公开的公钥 |
| 5 | X25519 私钥 / 公钥 | 密钥协商，建立共享秘密 | 原始公钥 32 字节 | 不是 Ed25519，不能拿来签名；共享秘密还需经 KDF 派生 |
| 6 | 专门或较少用的类型 | 特定标准、历史系统、后量子试验 | Ed448、SM2、DSA、ML-DSA、ML-KEM | DSA 不建议新选；SM2 要匹配对接标准；ML 系列由 3.5 引入，取决于构建与 provider |

前两项在通用证书和既有系统中更常见，不代表更适合所有新应用；签名授权选 Ed25519 的理由见原文。口令加密的私钥仍是私钥，加密只保护它在磁盘上的存储。

### 先认格式，再认扩展名

| 格式 / 标记 | 存放什么 | 常见后缀 / 说明 |
| :-- | :-- | :-- |
| PEM | Base64 包装的 DER 结构，带头尾标记 | `.pem`、`.crt`、`.key` 都可能是 PEM；扩展名不可靠 |
| `BEGIN PRIVATE KEY` | 未加密 PKCS#8 私钥 | `genpkey` 的常用输出；算法信息在内部 |
| `BEGIN ENCRYPTED PRIVATE KEY` | 加密 PKCS#8 私钥 | 读取时需要口令 |
| `BEGIN PUBLIC KEY` | SPKI 公钥，含算法标识 | `pkey -pubout` 的常用输出，适合跨语言交换 |
| `BEGIN CERTIFICATE` | X.509 证书，含公钥、身份与签发者签名 | 证书不是私钥 |
| DER | 二进制编码 | `.der`、`.cer`；不是一种密钥算法 |
| PKCS#12 | 私钥、证书及可选链的打包容器 | `.p12`、`.pfx`，通常有口令保护 |
| 传统私钥 | 如 `BEGIN RSA PRIVATE KEY`、`BEGIN EC PRIVATE KEY` | RSA 为 PKCS#1，EC 为 SEC1；别与 PKCS#8 混淆 |
| OpenSSH 格式 | 如 `BEGIN OPENSSH PRIVATE KEY`、`ssh-ed25519 AAAA...` | 用于 SSH，不等同于上面的 PEM / SPKI |

### 生成私钥与导出公钥

```sh title="generate-keys.sh"
# Linux / macOS：让之后创建的文件默认只允许当前用户访问
umask 077

# RSA：显式指定长度，不依赖默认值
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out rsa-private.pem
openssl pkey -in rsa-private.pem -pubout -out rsa-public.pem

# EC / ECDSA：P-256
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out ec-private.pem
openssl pkey -in ec-private.pem -pubout -out ec-public.pem

# Ed25519：长度由算法固定，不设 rsa_keygen_bits 或 EC 曲线参数
openssl genpkey -algorithm ED25519 -out ed25519-private.pem
openssl pkey -in ed25519-private.pem -pubout -out ed25519-public.pem

# 需要口令保护时，在生成阶段直接加密；随后交互输入口令
openssl genpkey -algorithm ED25519 -aes-256-cbc -out ed25519-protected.pem
```

`umask` 只适用于 POSIX 环境，而且会影响当前 shell 后续创建的文件；Windows 用文件 ACL 控制访问。未加密私钥便于程序自动读取，但要依靠目录权限、部署秘密管理等保护。

| `genpkey` 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-algorithm` | `RSA`、`EC`、`ED25519`、`X25519` | 选择密钥算法；算法支持以当前 provider 为准 |
| `-out` | 文件路径 | 写入私钥 |
| `-pkeyopt` | `参数名:值`，可重复 | 传入算法专用参数，不同算法不能混用 |
| `rsa_keygen_bits` | `3072`、`2048`、`4096` | RSA 位数；更长会增加生成、签名与验证成本 |
| `ec_paramgen_curve` | `P-256`、`P-384`、`prime256v1`、`secp384r1` | EC 曲线名；前后两组对应相同的常用曲线 |
| `-aes-256-cbc` | 开关 | 口令加密生成的私钥；不是把算法改成 AES |
| `-outform` | `PEM`、`DER` | 私钥输出编码；跨版本的加密 DER 行为不要类推，建议用加密 PEM 或专门的 `pkcs8` |
| `-pass` | `env:变量名`、`file:文件路径` 等 | 生成时的口令来源；省略则交互提示 |
| `rsa_keygen_pubexp` | 通常 `65537` | RSA 公共指数；默认通常已合适，不随意改成小值 |
| `ec_param_enc` | `named_curve`、`explicit` | 常用命名曲线；显式参数兼容性较差 |
| `-provider` / `-propquery` | provider 名 / 属性查询 | OpenSSL 3.x 扩展，普通操作通常不用显式指定 |

### 检查、转换与保护现有密钥

```sh title="inspect-key.sh"
# 检查私钥内部一致性；不打印私钥参数
openssl pkey -in rsa-private.pem -check -noout

# 公钥以公钥方式读取；不要遗漏 -pubin
openssl pkey -pubin -in rsa-public.pem -pubcheck -noout

# 只显示公钥部分的详细信息
openssl pkey -in rsa-private.pem -text_pub -noout

# 给已有私钥加口令保护；使用新文件名
openssl pkey -in rsa-private.pem -aes-256-cbc -out rsa-protected.pem

# 去掉保护，输入旧口令；输出成为未加密私钥
openssl pkey -in rsa-protected.pem -out rsa-unprotected.pem

# 公钥转 DER / 再转回 PEM
openssl pkey -pubin -in rsa-public.pem -outform DER -out rsa-public.der
openssl pkey -pubin -inform DER -in rsa-public.der -out rsa-public-restored.pem
```

| `pkey` 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-in` / `-out` | 文件路径 | 输入 / 输出密钥 |
| `-pubout` | 开关 | 输出公钥；省略通常输出私钥 |
| `-pubin` | 开关 | 输入是公钥，不是私钥 |
| `-check` / `-pubcheck` | 开关 | 检查私钥 / 公钥一致性，能力取决于算法实现 |
| `-noout` | 开关 | 不输出密钥编码 |
| `-text_pub` | 开关 | 显示公钥参数；`-text` 可能显示私钥秘密，不放进日志 |
| `-inform` / `-outform` | `PEM`、`DER` | 输入 / 输出格式 |
| `-aes-256-cbc` | 开关 | 给输出私钥加口令保护 |
| `-passin` / `-passout` | 口令来源字符串 | 输入私钥口令 / 输出私钥口令 |
| `-traditional` | 开关 | 为支持的算法输出传统私钥格式，仅在接收方明确要求时使用 |

### 判断证书和私钥是否配对

```sh title="match-certificate-key.sh"
# 从证书和私钥分别取得相同的 SPKI DER 公钥，再算摘要
openssl x509 -in cert.pem -pubkey -noout -out cert-public.pem
openssl pkey -pubin -in cert-public.pem -outform DER -out cert-public.der
openssl pkey -in private.pem -pubout -outform DER -out key-public.der
openssl dgst -sha256 cert-public.der key-public.der
```

两份文件的摘要应相同。任何前序命令失败都要先停止检查，避免误用旧输出文件。此方法可用于 RSA、EC 等类型，比只比较 RSA 的 modulus 更通用。

## 7. 签名与验签：Ed25519、RSA-PSS、ECDSA

先准备一份 `input.txt`。签名验证针对文件的**原始字节**，编码、换行、JSON 空格和字段顺序变化都可能让验签失败。以下操作依赖上一节生成的相应密钥。

### Ed25519：对应签名授权场景

```sh title="sign-ed25519.sh"
# 签名：使用私钥；保留 -rawin 以兼容 OpenSSL 3.0～3.4
openssl pkeyutl -sign -rawin -inkey ed25519-private.pem \
  -in input.txt -out ed25519.sig

# 验签：使用公钥；签名在 -sigfile，原文在 -in
openssl pkeyutl -verify -rawin -pubin -inkey ed25519-public.pem \
  -in input.txt -sigfile ed25519.sig

# 签名二进制转 Base64，便于放进文本文件
openssl base64 -A -in ed25519.sig -out ed25519.sig.b64
```

Ed25519 不接受外部 `-digest sha256`，也不要先把原文做 SHA-256 再套用这些命令。OpenSSL 实现的是 pure Ed25519；内部摘要是算法的一部分。3.5 起可省略 `-rawin`，这里显式保留。

**使用磁盘文件作为 `-in`**：3.5 的 Ed25519 实现需要预先知道输入大小并一次性处理；不要把签名原文直接通过 stdin 管道传入，也不适合拿它演示超大文件签名。OpenSSL 1.1.1 虽能生成密钥，其 `pkeyutl` 不能执行这一组 Ed25519 操作；可以升级或使用原文中的语言库。

### RSA-PSS：显式约定填充与摘要

```sh title="sign-rsa-pss.sh"
openssl dgst -sha256 -sign rsa-private.pem -out rsa-pss.sig \
  -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:digest \
  -sigopt rsa_mgf1_md:sha256 input.txt

openssl dgst -sha256 -verify rsa-public.pem -signature rsa-pss.sig \
  -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:digest \
  -sigopt rsa_mgf1_md:sha256 input.txt
```

`RSA-PSS` 是签名方案；`RSA` 是这里生成的通用密钥类型，二者不是同一层概念。对接旧协议要求 PKCS#1 v1.5 时，可以在 RSA 的 `dgst -sign/-verify` 示例中去掉三项 `-sigopt`，但双方必须明确约定，不能让 PSS 与 PKCS#1 v1.5 混用。

### ECDSA：注意签名编码

```sh title="sign-ecdsa.sh"
openssl dgst -sha256 -sign ec-private.pem -out ecdsa.sig input.txt
openssl dgst -sha256 -verify ec-public.pem -signature ecdsa.sig input.txt
```

OpenSSL 的 ECDSA 签名通常是 ASN.1 DER 编码的 `(r, s)`，不是 JWT 等协议常用的定长 `r || s`。算法相同仍可能因为签名编码不同而无法互验。

| 参数 / key | 常用值 / 类型 | 适用子命令与含义 |
| :-- | :-- | :-- |
| `-sign` / `-verify` | 开关或密钥路径 | `pkeyutl` 中是操作开关；`dgst` 中后接私钥 / 公钥路径 |
| `-inkey` | 密钥文件路径 | `pkeyutl` 使用的签名 / 验证密钥 |
| `-in` | 原文文件路径 | `pkeyutl` 的原文；`dgst` 原文放在末尾 |
| `-out` | 签名文件路径 | 签名通常为二进制，交付文本前按协议编码 |
| `-pubin` | 开关 | `pkeyutl` 的输入 key 是公钥 |
| `-sigfile` / `-signature` | 签名文件路径 | 分别属于 `pkeyutl` / `dgst` 的验签参数 |
| `-rawin` | 开关 | `pkeyutl` 以原始消息作为输入；与“输入已经是摘要”区分 |
| `-sha256` | 开关 | `dgst` 中为 RSA / ECDSA 选择摘要；不适用于 Ed25519 |
| `-sigopt` / `-pkeyopt` | `参数名:值` | 分别给 `dgst` / `pkeyutl` 设置算法选项，可重复 |
| `rsa_padding_mode` | `pss`、`pkcs1`、`oaep` | PSS / PKCS#1 v1.5 用于相应 RSA 签名；OAEP 用于加密，不能用来签名 |
| `rsa_pss_saltlen` | `digest`、`auto`、`max`、整数 | PSS 盐长度；示例固定为摘要长度；`auto` 常用于验签自动识别 |
| `rsa_mgf1_md` | `sha256`、`sha384` 等 | RSA-PSS / OAEP 的 MGF1 摘要，双方约定一致 |

验签成功必须检查退出码为 0；文本可能是 `Verified OK` 或 `Signature Verified Successfully`，不要仅靠某个固定字符串识别成功。

## 8. CSR 与开发环境自签名证书

### 生成申请文件 CSR

```sh title="create-csr.sh"
# 使用已有 RSA 私钥；证书申请包含公钥，不包含私钥
openssl req -new -key rsa-private.pem -out server.csr -sha256 \
  -subj '/CN=example.com' \
  -addext 'subjectAltName=DNS:example.com,DNS:www.example.com'

# 检查申请内容与 CSR 自身签名
openssl req -in server.csr -noout -text -verify
```

CSR 交给 CA，私钥留在自己手中。CA 是否采纳 CSR 中的 SAN、用途等扩展，由签发策略决定；检查 CSR 不代表最终证书已经可信。

### 本地 HTTPS 的自签名证书

```sh title="create-local-certificate.sh"
# 仅用于本地开发；不加 -noenc 时会交互要求新私钥口令
openssl req -x509 -newkey rsa:3072 -sha256 -days 30 \
  -keyout localhost-key.pem -out localhost-cert.pem \
  -subj '/CN=localhost' \
  -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1' \
  -addext 'basicConstraints=critical,CA:FALSE' \
  -addext 'keyUsage=critical,digitalSignature,keyEncipherment' \
  -addext 'extendedKeyUsage=serverAuth'
```

自签名只表示证书由自己的密钥签发，不会让浏览器自动信任。应在受控开发环境显式配置信任，或使用开发 CA 工具。需要无口令私钥供开发服务自动启动时，OpenSSL 3.x 可加 `-noenc`；这会让生成的私钥失去口令保护。

| `req` 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-new` | 开关 | 生成新 CSR |
| `-key` | 私钥路径 | 使用已有密钥 |
| `-out` | 文件路径 | 保存 CSR 或证书，取决于模式 |
| `-subj` | 如 `/CN=example.com` | 不通过交互填写主题；复杂名称可用配置文件处理 |
| `-addext` | `扩展名=内容`，可重复 | SAN 用 `DNS:域名`、`IP:地址`；证书用途等也在此声明 |
| `-sha256` | 摘要算法 | RSA / EC 常用；Ed25519 的摘要选择由算法控制 |
| `-newkey` | `rsa:3072` 等 | 同时新建私钥，不要和已有 `-key` 方案混用 |
| `-keyout` | 文件路径 | 保存新生成的私钥 |
| `-x509` | 开关 | 输出自签名证书而非 CSR |
| `-days` | 正整数天数 | 自签名证书的有效期，不是 CSR 的有效期 |
| `-noenc` | 开关，OpenSSL 3.x | 新生成的私钥不加口令；旧版使用 `-nodes` |
| `-config` / `-extensions` / `-reqexts` | 配置路径 / section 名 | 多项扩展用配置文件管理，分别选择证书 / CSR 扩展段 |
| `-text` / `-noout` / `-verify` | 开关 | 检查 CSR 内容 / 抑制编码输出 / 验证 CSR 自身签名 |

## 9. PEM、DER、PFX / P12 互转

```sh title="convert-certificate.sh"
# 证书 PEM -> DER -> PEM
openssl x509 -in cert.pem -outform DER -out cert.der
openssl x509 -inform DER -in cert.der -out cert-restored.pem

# 私钥 + 叶子证书 + 中间证书 -> P12；会交互输入导出口令
openssl pkcs12 -export -inkey private.pem -in cert.pem \
  -certfile intermediates.pem -name 'example.com' -out bundle.p12

# 查看 P12 的算法和结构，不导出秘密
openssl pkcs12 -in bundle.p12 -info -noout

# 提取叶子证书 / 全部证书
openssl pkcs12 -in bundle.p12 -clcerts -nokeys -out leaf.pem
openssl pkcs12 -in bundle.p12 -nokeys -out all-certs.pem

# 提取私钥：默认重新用口令保护输出，按提示输入相应口令
openssl pkcs12 -in bundle.p12 -nocerts -out extracted-protected-key.pem
```

`-clcerts` 是 PKCS#12 中筛选非 CA 证书的历史选项名，并不表示提取出来的一定是客户端 TLS 证书。`cert.pem` 应与 `private.pem` 配对；`intermediates.pem` 不存在或不需要时，删去 `-certfile` 那一项。

| `pkcs12` 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-in` / `-out` | 文件路径 | 导入模式输入 P12；`-export` 模式输入 PEM 证书，输出 P12 |
| `-export` | 开关 | 创建 P12，省略则解析已有 P12 |
| `-inkey` | 私钥路径 | 导出时的私钥 |
| `-certfile` | PEM 证书文件 | 导出时附加中间证书等 |
| `-nokeys` / `-nocerts` | 开关 | 不输出私钥 / 不输出证书 |
| `-clcerts` / `-cacerts` | 开关 | 提取非 CA 证书 / CA 证书 |
| `-info` / `-noout` | 开关 | 查看结构与算法 / 不导出内容 |
| `-name` | 文本 | P12 友好名称 |
| `-passin` / `-passout` | 口令来源 | 读入口令 / 写出口令；交互使用可省略 |
| `-noenc` | 开关 | 提取私钥时不加密输出；慎用；1.1.1 使用 `-nodes` |
| `-legacy` | 开关，OpenSSL 3.x | 加载 legacy provider，读取使用 RC2 等算法的旧 P12；不作为新文件的默认方案 |
| `-keypbe` / `-certpbe` / `-macalg` | 算法名 | 3.x 默认通常为 AES-256-CBC 与 SHA-256 MAC；老接收方可能不兼容 |
| `-iter` | 正整数 | **导出**时指定加密与 MAC 迭代次数；与 `enc -iter` 的格式和默认值不同 |

旧 P12 报 `unsupported` 时，可先用 `openssl pkcs12 -legacy -in old.p12 -info -noout` 定位。OpenSSL 1.1.1 与 3.x 的默认 P12 保护算法不同；应优先升级接收方，兼容导出需明确测试，不要为全部新证书统一启用 `-legacy`。

## 10. 文件口令加密与 RSA 小数据加密

### `enc` 的传统文件加密

```sh title="encrypt-file.sh"
# 交互输入口令；随机盐默认开启，显式使用 PBKDF2 与 SHA-256
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -md sha256 \
  -in input.txt -out input.enc

# 解密时算法、KDF、迭代次数、摘要必须与加密端一致
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 \
  -in input.enc -out input.decrypted.txt
```

这是一组传统格式互操作示例。`200000` 是可调整的示例值，不是所有硬件的统一安全标准；按性能与口令强度评估。`enc` 格式不完整保存全部算法与 KDF 设置，需要额外记录参数。

::: warning CBC 加密没有认证标签

`openssl enc` 不支持 GCM / CCM 等认证加密模式。AES-CBC 的解密成功不代表文件未被篡改，`bad decrypt` 也不是可靠的完整性校验。新设计需要抵抗篡改的文件格式时，应使用成熟的认证加密工具或库，不要直接把 `-aes-256-cbc` 换成 `-aes-256-gcm`。

:::

| `enc` 参数 | 常用值 / 类型 | 说明 |
| :-- | :-- | :-- |
| `-in` / `-out` | 文件路径 | 输入 / 输出文件 |
| `-d` / `-e` | 开关 | 解密 / 加密；默认加密 |
| `-aes-256-cbc` | 算法开关 | 示例的对称加密模式；不是通用认证加密方案 |
| `-pbkdf2` | 开关 | 用 PBKDF2 从口令派生密钥；不要依赖旧默认派生方式 |
| `-iter` | 正整数 | 迭代次数，也会启用 PBKDF2；示例显式同时写二者 |
| `-md` | `sha256` 等 | 口令派生的摘要，编解密双方保持一致 |
| `-salt` | 开关 | 随机盐，默认开启；避免 `-nosalt` |
| `-pass` | 口令来源 | 不指定则交互提示 |
| `-a` / `-A` | 开关 | 加密输出转 Base64 / 按单行处理；解密也要配对使用 |
| `-K` / `-iv` | 十六进制原始 key / IV | 低层接口；不是口令，使用者负责尺寸、保密与不重复要求 |
| `-S` | 十六进制盐 | 不建议日常手动设置；3.0 起其盐头处理与 1.1.1 有差异 |

### RSA-OAEP：仅加密小数据

```sh title="encrypt-rsa-oaep.sh"
# small.bin 必须先准备，且长度不超过所选 RSA-OAEP 的限制
openssl pkeyutl -encrypt -pubin -inkey rsa-public.pem \
  -in small.bin -out small.rsa \
  -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 \
  -pkeyopt rsa_mgf1_md:sha256

openssl pkeyutl -decrypt -inkey rsa-private.pem \
  -in small.rsa -out small.decrypted.bin \
  -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 \
  -pkeyopt rsa_mgf1_md:sha256
```

`-encrypt` 使用公钥，`-decrypt` 使用私钥；签名不是“私钥加密”。OAEP 最大明文长度为 `模数字节数 - 2 × 摘要字节数 - 2`，所以 RSA-3072 + SHA-256 最多 **318 字节**，RSA-2048 + SHA-256 最多 **190 字节**。大文件应采用标准混合加密方案，不要切成 RSA 小块自行拼接。Ed25519 不能用于这组加密命令。

## 口令来源与 provider：较少使用但容易混淆

### 口令来源的常用顺序

`-passin`、`-passout`、`-pass` 后面通常是**来源描述字符串**，不是算法名，也不应该直接填真实密码。下面的 `OPENSSL_INPUT_PASS`、`OPENSSL_OUTPUT_PASS` 是示例变量名，需要由调用环境安全提供。

| 顺序 | 写法 | 常见场景 / 注意事项 |
| :-- | :-- | :-- |
| 1 | 省略口令选项，按提示输入 | 人工操作，避免进入命令历史 |
| 2 | `env:OPENSSL_INPUT_PASS` | 自动化从环境变量读取；环境仍可能被同权限进程或日志泄露，不等于秘密保险箱 |
| 3 | `file:/受保护的路径/pass.txt` | 从文件首行读取，限制权限；清理、备份与日志都要考虑 |
| 4 | `stdin` | 从标准输入读取；会与业务输入抢 stdin，慎与管道组合 |
| 5 | `fd:3` | 从文件描述符读取，常见于 POSIX 自动化；Windows 不支持此来源 |
| 6 | `pass:明文` | 易泄露到进程列表、历史与日志，避免用于真实口令 |

```sh title="password-source.sh"
# 前提：执行环境已安全提供这两个变量；不在脚本里赋真实口令
openssl pkey -in rsa-protected.pem -passin env:OPENSSL_INPUT_PASS \
  -aes-256-cbc -passout env:OPENSSL_OUTPUT_PASS -out rsa-reprotected.pem
```

`genpkey` 用 `-pass` 设置新密钥口令；`pkey` 用 `-passin/-passout` 区分输入与输出；`enc` 用 `-pass`。不要把一个子命令的选项直接搬到另一个子命令。

### OpenSSL 3.x 的 provider

| 顺序 | 名称 / 参数 | 用途 |
| :-- | :-- | :-- |
| 1 | `default` | 常见算法实现，普通示例通常自动加载 |
| 2 | `legacy` | 兼容旧算法，不是新系统的默认选择 |
| 3 | `fips` | 使用经过对应验证的模块与配置；不能仅凭名称判断合规 |
| 4 | `-provider 名称` | 显式加载 provider，可重复 |
| 5 | `-provider-path 路径` | 设置 provider 模块搜索目录 |
| 6 | `-propquery 'fips=yes'` | 按属性选择实现；前提是相应模块和配置可用 |

手动加载 provider 后，不要假设 `default` 仍会自动加载；需要现代与旧算法并存时，可显式同时指定 `-provider default -provider legacy`。不要为了修复一个旧 P12 就全局降低 TLS 安全策略。FIPS 模块是否支持某个算法，要查**所用模块版本、验证范围与安全策略**，不能只看 `openssl version`。

## 常见问题速查

| 现象 | 先检查什么 | 常见处理 |
| :-- | :-- | :-- |
| `Algorithm ED25519 not found` / `unsupported` | `openssl version -a`、provider、实际可执行路径 | 使用支持该算法的社区 OpenSSL，核对配置与构建；不要把 LibreSSL 版本号当成 OpenSSL 版本号 |
| Ed25519 提示不支持操作 | 是否为 1.1.1；3.0～3.4 是否加 `-rawin` | 1.1.1 的 `pkeyutl` 不支持此操作；升级或用语言库 |
| `Could not read key` | 输入是公钥还是私钥、PEM 还是 DER、是否需要口令 | 公钥加 `-pubin`，DER 加 `-inform DER`，加密私钥提供正确口令 |
| `unable to get local issuer certificate` | 中间证书、CA 文件、默认信任目录 | 修复服务器链或正确提供信任根，不直接关闭验证 |
| 证书域名不匹配 | SAN、SNI、连接 IP 与域名是否混用 | 区分 `-servername` 和 `-verify_hostname/-verify_ip` |
| `bad decrypt` | 口令、算法、KDF、迭代次数、盐处理、文件是否完整 | 使用加密时相同参数；不能据此可靠区分口令错误和篡改 |
| `data too large for key size` | 是否用 RSA 加密了大文件 | 检查 OAEP 长度上限，改用标准混合加密方案 |
| 跨语言验签失败 | 输入字节、摘要、PSS 盐长度、签名编码 | 用相同文件验签，区分 DER、原始字节、hex、Base64 |

## 官方参考

- [社区发布版本与支持时间](https://openssl-library.org/source/)
- [OpenSSL 3.5 命令入口](https://docs.openssl.org/3.5/man1/openssl/)
- [x509：证书查看与转换](https://docs.openssl.org/3.5/man1/openssl-x509/)、[verify：证书链验证](https://docs.openssl.org/3.5/man1/openssl-verify/)、[s_client：TLS 诊断](https://docs.openssl.org/3.5/man1/openssl-s_client/)
- [dgst：摘要与签名](https://docs.openssl.org/3.5/man1/openssl-dgst/)、[rand：随机数据](https://docs.openssl.org/3.5/man1/openssl-rand/)
- [genpkey：生成密钥](https://docs.openssl.org/3.5/man1/openssl-genpkey/)、[pkey：密钥读取与转换](https://docs.openssl.org/3.5/man1/openssl-pkey/)、[pkeyutl：签名与公钥操作](https://docs.openssl.org/3.5/man1/openssl-pkeyutl/)
- [req：CSR 与自签名证书](https://docs.openssl.org/3.5/man1/openssl-req/)、[pkcs12：P12 打包](https://docs.openssl.org/3.5/man1/openssl-pkcs12/)、[enc：传统加密与 Base64](https://docs.openssl.org/3.5/man1/openssl-enc/)
- [口令来源参数](https://docs.openssl.org/3.5/man1/openssl-passphrase-options/)、[provider 机制](https://docs.openssl.org/3.5/man7/provider/)、[3.x 迁移说明](https://docs.openssl.org/3.5/man7/ossl-guide-migration/)
