---
title: 用签名认证给程序加「使用期限」：Python / Go / Rust 实战
createTime: 2026/10/10 16:20:00
tags:
  - python
  - golang
  - rust
  - nuitka
  - 签名授权
permalink: /blog/i1n48jnb/
---

接私活、做外包的时候，最常见的两难是：**程序已经能跑了，但尾款还没结**。直接把最终版本交出去，对方拿到手你就失去了所有筹码——拖着不付款，你一点办法都没有。

这篇文章教你做一个简单但有效的防护：**给程序加一道「签名认证」的锁，只有持有你签发的授权文件（license）且在有效期内的程序，才能运行**。程序到期自动停止工作，续期只需要你重新签发一个小文本文件，10 秒钟搞定。

## 先说清楚：这套方案防什么、不防什么

::: tip 本文方案的定位
- 防的是：==客户篡改授权文件里的到期日==、==授权文件被伪造==、==程序被白嫖延期使用==
- 不防的是：决心极强的逆向工程（反编译、破解）

和给门上装一把锁一样——它防得住顺手牵羊，防不住职业开锁匠。对绝大多数外包场景，这把锁已经足够用了。尾款的最终保障永远是合同与验收条款，==技术只是你手里的筹码==。
:::

整体方案由三样东西组成：

:::: card-grid
::: card title="私钥" icon="mdi:key"
你自己保管的"公章"，==永远不交付==。用它给授权文件签名，谁拿到它谁就能签发任意授权，所以只存在你自己的电脑（密码管理器）里。
:::
::: card title="公钥" icon="mdi:key-outline"
"验章卡"，==写死在程序源码里==，跟着程序一起编译交付。它只能用来验证签名，无法反推出私钥，被客户看到也无所谓。
:::
::: card title="license 授权文件" icon="mdi:file-certificate-outline"
一个普通的小文本文件，里面写着客户名、项目名、到期日，以及你用私钥盖的"章"。==交付时发给客户==，尾款结清后可以签发一张长期限的。
:::
::::

一个先抛出来的结论，贯穿全文：**密钥生成用一条 openssl 命令，签发工具全语言共用一份 Python 脚本，三种语言只需要各写验证端**。这也是避免重复造轮子的关键——license 文件格式是互通的，签的事情没必要做三遍。

## 原理：五分钟看懂签名认证

### 一个比喻

想象古代钱庄的票号：

1. 你有一枚**只有你能保管的私章**（私钥），平时锁在保险柜里，从不示人；
2. 你把**验章的底纹样式**（公钥）提前刻在每个分号掌柜的脑子里——他们知道真章长什么样，但刻不出真章；
3. 每次授权，你在一张写明「某某公司、可用至 2026 年 12 月 31 日」的票据（license 文件）上盖章，寄给客户；
4. 客户的程序启动时，先拿程序里内置的"底纹样式"核对这张票据：章是**真的**吗？日期**过了**吗？两个都通过才放行。

这里有个数学保证：从公钥**推算不出**私钥。所以客户既伪造不了新的授权文件，也改不了现有文件里的任何一个字——哪怕只把到期日从 `2026` 改成 `2027` 的一个字符，验签立刻失败。

### 为什么不直接在代码里写死一个日期

你可能会想：我在代码里写 `if today > "2026-12-31": exit()` 不就行了？能用，但对比一下：

| | 代码里写死日期 | 签名 + license 文件 |
| :-- | :-- | :-- |
| 修改有效期 / 续授权 | 每次都要重新编译、重新交付 | ==本地重签一个文本文件发过去==即可 |
| 客户篡改时间 | 改系统时间就能绕过 | 签名挡住文件篡改，时间问题需配套处理（见后文） |
| 承载更多信息 | 只有一个日期 | 客户名、项目名、机器码都能写入并受签名保护 |
| 分批开发 / 试用版 | 每个版本单独编译 | 一把私钥按需签发不同期限即可 |

> [!NOTE]
> 这种「内容 + 签名」的结构，其实就是去掉了冗余头信息的简化版 **JWT**（JSON Web Token）。Web 开发里的 access token 能保证"令牌内容没人动过"，用的正是同一套原理。

## 整体操作流程

无论最终交付什么语言的程序，你手上的动作永远是这四步：

::: steps
1. **生成密钥对**（一次性动作）
   在你自己的电脑上用 openssl 生成一对密钥：私钥是 `license.pem` 自己保管，公钥导出成 32 字节 hex 写进程序源码。一个项目用一对即可，不用反复生成。
2. **把公钥写死在程序里，写好验证逻辑**
   程序启动时读取 `license.key`，先验签、再检查到期日，任何一步失败就提示并退出。随后编译成交付物（Python 用 Nuitka、Go/Rust 自带编译）。
3. **用签发工具生成 license 文件**
   通用签发工具输入客户名、项目名、到期日，生成一个 `license.key` 小文件，连同程序一起交付。开发期内可以按阶段签发短期的。
4. **程序每次启动都验证**
   尾款结清后，重新签发一张长期限（或写个很远的日期）的 `license.key` 发给客户，皆大欢喜。
:::

### license 文件长什么样

交付给客户的 `license.key` 就是一个普通 JSON，肉眼一看就懂：

```json title="license.key（交付给客户的文件）"
{
  "payload": "eyJjdXN0b21lciI6Iuaxn+afpeeciCIsInByb2plY3QiOiLmlbDmja7miqUt56iL5a2mIiwiaXNzdWVkX2F0IjoiMjAyNi0xMC0xMCIsImV4cGlyZXNfYXQiOiIyMDI2LTEyLTMxIn0=",
  "signature": "8f2a9c81...（128 个十六进制字符，省略）"
}
```

`payload` 是一段 Base64，解码后就是明文信息：

```json title="payload 解码后的内容"
{
  "customer": "某某公司",
  "project": "月度报表系统",
  "issued_at": "2026-10-10",
  "expires_at": "2026-12-31"
}
```

`signature` 是你用私钥对 payload 原始字节盖的"章"，64 字节的 Ed25519 签名。

::: tip 为什么 payload 要整体 Base64 编码后再签名？
这是整套方案里**最值得注意的工程细节**。如果直接把「客户名、日期」平铺在license顶层、再对各字段验签，不同语言的 JSON 序列化行为（键名顺序、空格、中文转义）不一致，极易出现"Python 签的章，Go 程序验不过"的诡异问题。
本方案里，**被签名的对象是一段不可变的字节串**（Base64 之前的 payload 原文），验证端只对这段原文验签，序列化差异被彻底隔离。附带一个好处：==任意语言签发，任意语言验证，完全互通==——这也是本文"签发工具只写一份 Python，交付的却可以是 Go/Rust 程序"的底气所在。
:::

## 三种语言的库选型

2026 年，三种语言的主流域选择如下：

:::: card-grid
::: card title="Python：cryptography" icon="mdi:language-python"
PyCA 官方维护的密码学事实标准，底层 Rust 实现，Django、PyJWT 等主流项目都依赖它。Ed25519 支持完善，Nuitka 打包兼容良好。
:::
::: card title="Go：标准库 crypto/ed25519" icon="mdi:language-go"
Go 1.13 起内置在标准库里，==零三方依赖==，一个 import 全搞定。Go 的哲学：常用密码学能力官方养着，用法各语言里也最简洁。
:::
::: card title="Rust：ed25519-dalek" icon="mdi:language-rust"
dalek-cryptography 组织维护的纯 Rust 实现，Rust 生态中 Ed25519 的事实标准，签名速度业界领先，API 简洁。
:::
::::

::: details 为什么选 Ed25519 而不是 RSA？
- 密钥和签名都小：私钥 32 字节、签名 64 字节；RSA-3072 光签名就 384 字节
- 签名/验签快，且没有"参数选错就不安全"的坑（RSA 的填充方式、密钥长度都容易踩坑）
- 3072 位以下的 RSA 正被各标准逐步淘汰，新项目默认选 Ed25519 即可；只有对接 legacy 系统（老 JWT、老接口）时才需要 RSA
:::

::: details 进阶：直接用标准 JWT 也是一条路
本文的 `payload + signature` 结构，本质就是去掉头部冗余的 JWT。如果你不介意 license 换成 `header.payload.signature` 三段式、到期字段换成 unix 时间戳 `exp`，那么验证端可以直接改用各语言的主流 JWT 库——Python `pyjwt`、Go `golang-jwt/jwt/v5`、Rust `jsonwebtoken`，连「检查是否过期」都是库内置的；签发端也有 smallstep 的 `step` CLI 这类现成工具。
代价是 license 可读性下降（全是 Base64），排查问题不如本文的自定义结构直观。两个方案的安全性完全等价，选顺手的即可。
:::

## 第 0 步（三种语言通用）：生成密钥对

密钥生成**不需要写任何代码**——OpenSSL 1.1.1 起原生支持 Ed25519，两条命令取代每种语言各写一份的 keygen 脚本。安装、版本差异、参数含义，以及日常证书与签名命令，见 [OpenSSL 日常使用手册](/blog/mon19sbt/)。该手册以社区 OpenSSL 3.5 LTS 为基准；这里的 1.1.1 是生成 Ed25519 密钥的最低版本说明，不代表建议继续使用已结束社区支持的版本：

```sh title="生成密钥对（每个项目做一次）"
# 1. 生成私钥（PKCS#8 PEM 文件，妥善保管，永不交付）
openssl genpkey -algorithm ED25519 -out license.pem

# 2. 导出公钥 hex（64 个字符，等下嵌进交付程序里）
openssl pkey -in license.pem -pubout -outform DER | tail -c 32 | xxd -p -c 64
```

第二条命令的原理：Ed25519 公钥的 DER 编码固定为 44 字节（12 字节头部 + 32 字节公钥本体），所以 `tail -c 32` 截取的就是公钥本体，`xxd -p` 转成 hex。如果环境里没有 `xxd`，换成 `od -An -tx1 | tr -d ' \n'` 等效。

输出示例（你的当然会不一样）：

```
f1e44fdfd3111c18702d39fdeb63a44a015da3567240ecee15e2b588ad4da628
```

把这串公钥 hex 存好，三种语言的验证代码里都要嵌它。

::: warning macOS 注意：先确认是 OpenSSL 还是 LibreSSL

一些 macOS 版本的 `/usr/bin/openssl` 实际是 **LibreSSL**，它与社区 OpenSSL 的版本号、算法和选项不能直接对应。先跑 `openssl version -a` 确认身份；若生成 Ed25519 时出现 `Algorithm ED25519 not found`，可安装 Homebrew 的 OpenSSL，并把对应目录放到当前终端 PATH 前面：`brew install openssl@3`，随后执行 `export PATH="$(brew --prefix openssl@3)/bin:$PATH"`。这一写法兼容 Apple Silicon 与 Intel 的 Homebrew 前缀；安装得到的具体分支仍需检查，不能把 `openssl@3` 理解为固定的 3.5 LTS。

顺带解释一个常见疑惑：为什么 `openssl --help` 里搜不到 ed25519？因为 `--help` 只列出子命令（genpkey、x509……），而 `ED25519` 是 `genpkey` 的 `-algorithm` 参数值，不是子命令——新算法没有专属命令，都走通用机制。想确认手里的 openssl 支持哪些算法，用这个：

```sh title="check-ed25519.sh"
openssl list -public-key-algorithms | grep -i ed25519   # 查看是否列出该算法；生成命令是实际能力检查
```

:::

::: warning 私钥即权力
谁能拿到 `license.pem`，谁就能给任何客户签任意日期的授权文件。放进密码管理器、离线备份都行，但==不要提交进 Git 仓库==（建议 `.gitignore` 加一行 `*.pem`），更不要让它出现在任何交付物里。
:::

::: tip 一个项目一对密钥
不要所有客户共用同一对密钥，否则一个项目出问题全部跟着换。要做隔离时，把上面两条命令再跑一遍就是全新的一对，互不影响。
:::

## Python：签发工具 + 验证模块（cryptography + Nuitka）

Python 在本文里承担两件事：写**唯一一份**签发工具（三种语言通用），以及你自己交付 Python 程序时的验证模块。

### 项目结构

::: file-tree title="项目结构（license-demo）"
- license-demo
  - license.pem # 私钥（openssl 生成） **永不交付**
  - issue_license.py # 通用签发工具 **永不交付**
  - license_check.py # 验证模块（公钥写死，随程序编译交付）
  - app.py # 主程序（换成你的业务代码）
  - license.key # 按需生成，交付时发给客户
  :::

先安装依赖：

::: code-tabs

@tab:active uv

```sh
uv add cryptography nuitka
```

@tab pip

```sh
pip install cryptography nuitka
```

:::

### 签发工具（只在自己电脑运行，所有项目共用）

签发工具从命令行参数读私钥文件、客户信息，不再把密钥硬编码在脚本里——所以**这一份脚本可以放进你的工具目录，所有项目共用**：

```python title="issue_license.py"
"""通用签发工具：只在你自己的电脑上运行，与交付物无关（三种语言通用一份）。

用法：uv run issue_license.py <私钥.pem> <客户名> <项目名> <到期日 YYYY-MM-DD>
"""
import base64
import json
import sys
from datetime import date
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey


def main() -> None:
    if len(sys.argv) != 5:
        sys.exit(f"用法: {sys.argv[0]} <私钥.pem> <客户名> <项目名> <到期日 YYYY-MM-DD>")
    key_path, customer, project, expires_str = sys.argv[1:5]

    # 顺便校验日期格式是否合法，避免手滑签出废纸
    expires = date.fromisoformat(expires_str)

    # 从 openssl 生成的 PEM 文件加载私钥
    key = serialization.load_pem_private_key(Path(key_path).read_bytes(), password=None)
    if not isinstance(key, Ed25519PrivateKey):
        sys.exit("密钥文件不是 Ed25519 私钥，请检查 openssl 生成命令")

    # 签名对象是这段 JSON 的原始 UTF-8 字节（不是文件里那个外层结构！）
    payload = json.dumps(
        {
            "customer": customer,
            "project": project,
            "issued_at": date.today().isoformat(),
            "expires_at": expires.isoformat(),
        },
        ensure_ascii=False,     # 中文客户名不转义，不同语言行为一致
        separators=(",", ":"),  # 紧凑输出，去掉多余空格
    ).encode("utf-8")

    license_obj = {
        "payload": base64.b64encode(payload).decode("ascii"),
        "signature": key.sign(payload).hex(),
    }

    with open("license.key", "w", encoding="utf-8") as f:
        json.dump(license_obj, f, indent=2, ensure_ascii=False)

    print(f"已生成 license.key（有效期至 {expires}）")


if __name__ == "__main__":
    main()
```

```sh title="签发一条授权"
uv run issue_license.py license.pem "某某公司" "月度报表系统" 2026-12-31
```

::: tip 把它升级成全局命令
把 `issue_license.py` 单独放进一个目录执行 `uv tool install .`，就会得到一个全局的 `issue-license` 命令；以后任何项目签授权都是一条命令的事，不用再复制脚本。
:::

### 验证模块（随程序编译交付）

```python title="license_check.py"
"""验证模块：公钥嵌死在这里，随主程序一起编译交付。"""
import base64
import json
import sys
from datetime import date
from pathlib import Path

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

# 换成你的公钥（openssl 导出的 64 个 hex 字符）
PUBLIC_KEY_HEX = "在这里粘贴公钥"


class LicenseError(Exception):
    """授权校验失败"""


def app_dir() -> Path:
    """返回程序所在目录。

    注意：Nuitka --onefile 模式下，程序启动前会先解压到临时目录，
    __file__ 指向的是临时目录，所以 license.key 要以 exe 的位置为准。
    """
    if getattr(sys, "frozen", False):  # 被 Nuitka 编译后此值为真
        return Path(sys.executable).parent
    return Path(__file__).parent


def verify_license() -> dict:
    license_path = app_dir() / "license.key"

    try:
        raw = json.loads(license_path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise LicenseError("未找到 license.key，请将其放在程序同目录下")
    except json.JSONDecodeError:
        raise LicenseError("license.key 文件损坏")

    try:
        payload_bytes = base64.b64decode(raw["payload"])
        signature = bytes.fromhex(raw["signature"])
    except (KeyError, ValueError):
        raise LicenseError("license.key 内容不完整或格式错误")

    public_key = Ed25519PublicKey.from_public_bytes(bytes.fromhex(PUBLIC_KEY_HEX))
    try:
        # 核心一步：公钥验签，篡改任何一个字节都会失败
        public_key.verify(signature, payload_bytes)
    except InvalidSignature:
        raise LicenseError("license 无效：签名校验失败")

    # 能验过签名，内容才是可信的，此时才能解析
    info = json.loads(payload_bytes)
    expires = date.fromisoformat(info["expires_at"])

    if date.today() > expires:  # 到期日当天仍可使用
        raise LicenseError(f"授权已于 {expires} 到期，请联系开发者续期")

    return info
```

### 主程序集成与 Nuitka 编译

```python title="app.py"
"""主程序：把它换成你的真实业务逻辑。"""
from license_check import LicenseError, verify_license


def main() -> None:
    try:
        info = verify_license()
    except LicenseError as e:
        print(f"[授权校验未通过] {e}")
        raise SystemExit(1)

    print(f"授权有效：{info['customer']} / {info['project']}，有效期至 {info['expires_at']}")

    # ↓↓↓ 真正的业务逻辑从这里开始 ↓↓↓
    print("程序开始运行...")


if __name__ == "__main__":
    main()
```

```sh title="Nuitka 编译命令"
uv run nuitka --onefile --standalone --include-package=cryptography app.py
```

产物是一个独立的 `app.exe`。交付时只需要给客户两个文件：`app.exe + license.key`。==`license.pem`、`issue_license.py`、私钥，一个都不要出现在交付物里==。

> [!TIP]
> cryptography 是带二进制扩展的包，`--include-package=cryptography` 可以确保它的动态库一起被打进去。更多 Nuitka 参数与踩坑记录（含 onefile 的路径问题），见 [《Nuitka 打包实战指南》](/blog/w3xlirj5/)。

## Go：交付端只写验证（标准库就够）

得益于 license 格式跨语言互通，==交付 Go 程序时，签发仍然用上面的 Python 工具==（想用 Go 原生签发，把签名逻辑换成总结表格里的 `ed25519.Sign` 调用即可，十几行的事）。Go 侧只需要写验证逻辑，而它整个来自标准库：

```go title="app/main.go"
package main

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// 公钥嵌死在代码里（64 个 hex 字符），编译后客户无法替换
const publicKeyHex = "在这里粘贴公钥"

type payloadInfo struct {
	Customer  string `json:"customer"`
	Project   string `json:"project"`
	IssuedAt  string `json:"issued_at"`
	ExpiresAt string `json:"expires_at"`
}

func main() {
	raw, err := os.ReadFile("license.key")
	if err != nil {
		fmt.Println("[授权校验未通过] 未找到 license.key，请将其放在程序同目录下")
		os.Exit(1)
	}

	var licenseFile struct {
		Payload   string `json:"payload"`
		Signature string `json:"signature"`
	}
	if err := json.Unmarshal(raw, &licenseFile); err != nil {
		fmt.Println("[授权校验未通过] license.key 文件损坏")
		os.Exit(1)
	}

	payload, err := base64.StdEncoding.DecodeString(licenseFile.Payload)
	if err != nil {
		fmt.Println("[授权校验未通过] payload 解码失败")
		os.Exit(1)
	}
	sig, err := hex.DecodeString(licenseFile.Signature)
	if err != nil {
		fmt.Println("[授权校验未通过] signature 解码失败")
		os.Exit(1)
	}

	pub, err := hex.DecodeString(publicKeyHex)
	if err != nil || len(pub) != ed25519.PublicKeySize {
		fmt.Println("内置公钥异常") // 密钥写错了，编译前就该发现
		os.Exit(1)
	}

	// 核心一步：公钥验签，篡改任何一个字节都会失败
	if !ed25519.Verify(ed25519.PublicKey(pub), payload, sig) {
		fmt.Println("[授权校验未通过] license 无效：签名校验失败")
		os.Exit(1)
	}

	var info payloadInfo
	if err := json.Unmarshal(payload, &info); err != nil {
		fmt.Println("[授权校验未通过] payload 解析失败")
		os.Exit(1)
	}

	// ISO 日期的字典序就是时间顺序，直接字符串比较；到期日当天仍可使用
	if today := time.Now().Format("2006-01-02"); today > info.ExpiresAt {
		fmt.Printf("[授权校验未通过] 授权已于 %s 到期，请联系开发者续期\n", info.ExpiresAt)
		os.Exit(1)
	}

	fmt.Printf("授权有效：%s / %s，有效期至 %s\n", info.Customer, info.Project, info.ExpiresAt)

	// ↓↓↓ 真正的业务逻辑从这里开始 ↓↓↓
	fmt.Println("程序开始运行...")
}
```

```sh title="编译交付"
go build -trimpath -ldflags "-s -w" -o report-app ./app
```

交付物就是 `report-app` 和 `license.key` 两个文件。

## Rust：交付端只写验证（ed25519-dalek）

Rust 同理：验证端独立成项目，签发继续用 Python 工具。依赖如下（比早期版本精简——验证端用不到随机数相关的 feature）：

```toml title="Cargo.toml"
[package]
name = "report-app"
version = "0.1.0"
edition = "2021"

[dependencies]
ed25519-dalek = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
chrono = "0.4"
base64 = "0.22"
hex = "0.4"
```

```rust title="src/main.rs"
use std::fs;

use base64::{engine::general_purpose::STANDARD, Engine as _};
use chrono::Local;
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::Deserialize;

/// 公钥嵌死在代码里（64 个 hex 字符），编译后客户无法替换
const PUBLIC_KEY_HEX: &str = "在这里粘贴公钥";

#[derive(Deserialize, Debug)]
struct Payload {
    customer: String,
    project: String,
    #[serde(rename = "issued_at")]
    _issued_at: String, // 交付程序通常不关心签发日，占位即可
    expires_at: String,
}

fn main() {
    match run() {
        Ok(info) => {
            println!(
                "授权有效：{} / {}，有效期至 {}",
                info.customer, info.project, info.expires_at
            );
            // ↓↓↓ 真正的业务逻辑从这里开始 ↓↓↓
            println!("程序开始运行...");
        }
        Err(msg) => {
            eprintln!("[授权校验未通过] {msg}");
            std::process::exit(1);
        }
    }
}

fn run() -> Result<Payload, String> {
    let raw = fs::read_to_string("license.key")
        .map_err(|_| "未找到 license.key，请将其放在程序同目录下".to_string())?;
    let obj: serde_json::Value =
        serde_json::from_str(&raw).map_err(|_| "license.key 文件损坏".to_string())?;

    let payload_b64 = obj["payload"]
        .as_str()
        .ok_or_else(|| "license.key 缺少 payload 字段".to_string())?;
    let sig_hex = obj["signature"]
        .as_str()
        .ok_or_else(|| "license.key 缺少 signature 字段".to_string())?;

    let payload = STANDARD
        .decode(payload_b64)
        .map_err(|_| "payload 解码失败".to_string())?;
    let sig_bytes = hex::decode(sig_hex).map_err(|_| "signature 解码失败".to_string())?;
    let sig = Signature::from_slice(&sig_bytes).map_err(|_| "签名长度错误".to_string())?;

    let pub_bytes = hex::decode(PUBLIC_KEY_HEX).map_err(|_| "内置公钥异常".to_string())?;
    let vk = VerifyingKey::from_bytes(
        pub_bytes
            .as_slice()
            .try_into()
            .expect("公钥必须 32 字节"),
    )
    .expect("内置公钥异常");

    // 核心一步：公钥验签，篡改任何一个字节都会失败
    vk.verify(&payload, &sig)
        .map_err(|_| "license 无效：签名校验失败".to_string())?;

    let info: Payload = serde_json::from_slice(&payload)
        .map_err(|_| "payload 解析失败".to_string())?;

    // ISO 日期的字典序就是时间顺序，直接字符串比较；到期日当天仍可使用
    let today = Local::now().format("%Y-%m-%d").to_string();
    if today > info.expires_at {
        return Err(format!("授权已于 {} 到期，请联系开发者续期", info.expires_at));
    }

    Ok(info)
}
```

```sh title="编译交付"
cargo build --release
# 交付 target/release/report-app 和 license.key
```

## 常用加固手段

以上是最基本的骨架，下面几个手段可以按需叠加。

### 时间从哪来：联网校时与防回拨

签名保证了 license 文件本身不可篡改，但「今天是几号」却由本机时间说了算——客户把系统时间改回去年，日期检查就形同虚设。对策分三层，按需叠加。

#### 第 1 层：联网校时（主力）

不必专门接时间 API：**每个 HTTPS 响应都自带服务器时间（`Date` 响应头）**，标准库就能读，精度 1 秒，对"按天判过期"绰绰有余。

::: code-tabs

@tab:active Python

```python
from datetime import date
# HTTP Date 头用的是 RFC 2822 邮件日期格式，标准库的解析器恰好住在 email.utils
from email.utils import parsedate_to_datetime
from urllib.request import urlopen

with urlopen("https://www.baidu.com", timeout=5) as resp:
    # Date 头是 GMT 时间，解析函数自动带时区，直接取日期即可
    net_dt = parsedate_to_datetime(resp.headers["Date"])

net_date = net_dt.date()
```

@tab Go

```go
resp, err := http.Get("https://www.baidu.com")
if err != nil {
    // 网络不可用：走第 3 层的离线兜底策略
    return
}
defer resp.Body.Close()
t, err := http.ParseTime(resp.Header.Get("Date")) // time.Time，自带 UTC
netDate := t.Format("2006-01-02")
```

@tab Rust

需要给 `Cargo.toml` 补一个轻量 HTTP 客户端：`ureq = "3"`（维护活跃，阻塞式 API 简单）。

```rust
let resp = ureq::get("https://www.baidu.com").call()?;
// HTTP Date 头是 RFC 2822 格式，chrono 可直接解析
let date_str = resp
    .headers()
    .get("date")
    .and_then(|v| v.to_str().ok())
    .ok_or("响应缺少 Date 头")?;
let net_date = chrono::DateTime::parse_from_rfc2822(date_str)?.format("%Y-%m-%d").to_string();
```

:::

请求目标的选择原则：==你自己控制的域名或大厂域名==，别选小站（下线、被墙都会连累你的程序）。如果想用专门的时间源，备选方案：

| 方式 | 示例 | 说明 |
| :-- | :-- | :-- |
| 专用时间接口 | `cloudflare.com/cdn-cgi/trace` 里的 `ts=` 字段 | 免费无 key，unix 时间戳 |
| 专用时间接口 | 淘宝 `acs.m.taobao.com/gw/mtop.common.getTimestamp/` | JSON 毫秒时间戳，国内多年稳定 |
| NTP 协议 | Go 用 `beevik/ntp`、Rust 用 `rsntp` | 更"正统"但多一个依赖；服务器选 `ntp.aliyun.com`，别用 `pool.ntp.org`（国内不稳） |

#### 第 2 层：给时间也盖个章

第 1 层有个软肋：**时间响应本身可以被伪造**。客户改 hosts 把域名指向本机假服务器，返回"去年"的时间，校验就被骗过去了。解法与 license 一模一样——自建一个时间端点（任意云函数 / Worker，十几行代码），用你现有的同一把私钥给时间戳签名：

```json title="GET https://api.你的域名/time 的响应"
{ "ts": 1760489270, "sig": "（对 ts 的字节串做 Ed25519 签名）" }
```

客户端用嵌死在程序里的公钥验证 `sig` 之后才相信这个时间——伪造难度和伪造 license 相同，都需要你的私钥。这个端点以后还能顺带返回「剩余次数、功能开关」之类的字段，平滑升级成一个完整的授权服务器。

#### 第 3 层：本地兜底（离线宽限 + 防回拨记录）

联网失败 ≠ 立即锁死（客户临时断网就把程序锁了，体验太差）。推荐的组合：

- **离线宽限**：网取失败时允许继续用本机时间，但连续超过宽限期（比如 72 小时）没有成功联网过，才要求联网验证；
- **防回拨状态文件**：每次成功运行后把当天日期记下来，下次运行发现「今天」比记录还早就直接拒绝。生效时间始终取 `max(本机时钟, 状态文件记录的时间)`，回拨骗不过去。

以 Python 为例，不联网场景的最简实现：

```python title="clock_guard.py（可选的防回拨模块）"
from datetime import date
from pathlib import Path

from license_check import LicenseError


def guard_clock(state_file: Path) -> None:
    today = date.today()
    if state_file.exists():
        try:
            last = date.fromisoformat(state_file.read_text(encoding="utf-8").strip())
        except ValueError:
            last = None
        if last is not None and today < last:
            raise LicenseError("检测到系统时间被回拨，程序无法运行")
    state_file.write_text(today.isoformat(), encoding="utf-8")
```

在 `verify_license()` 通过之后再调用它：

```python title="app.py 中的调用方式"
from pathlib import Path

info = verify_license()           # 授权有效才记录
guard_clock(Path.home() / ".report_app.state")
```

Go / Rust 同理：启动时读用户目录下的状态文件（如 `~/.report_app.state`），日期出现倒退就拒跑，验证通过后再更新。如果程序联网，记录的值可以换成第 1 层拿到的网络时间，兜底更扎实。

::: caution 清醒认识这三层的分工
每层都有绕过手段：改 hosts 骗第 1 层、删状态文件绕第 3 层。==联网校验（最好带签名）是主力，状态文件只是断网时的兜底==，两者叠加意味着客户要同时应付两条线。要求更高时，可同时请求 2~3 个时间源交叉验证，差异过大直接走保守策略（拒绝运行）。
:::

### 机器码绑定：防止一个 license 复制多台机器

如果担心客户把程序拷给别的机器用，在 payload 里加一个 `machine_id` 字段：

```json title="payload 增加机器码字段"
{
  "customer": "某某公司",
  "project": "月度报表系统",
  "issued_at": "2026-10-10",
  "expires_at": "2026-12-31",
  "machine_id": "9f2c0b1a3e5d..."
}
```

签发前让客户跑一次你提供的指纹小工具（或远程指导执行一条命令）把机器码发给你，你签进 license；程序验证时对比「license 里的机器码 == 本机计算的机器码」。常用取法：

```sh title="获取本机指纹"
# Windows（Win11 上 wmic 已移除，用 PowerShell）
powershell -c "(Get-CimInstance Win32_ComputerSystemProduct).UUID"
# Linux
cat /etc/machine-id
# macOS
ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID
```

拿到 UUID 后做个 SHA-256 摘要再写进 payload，长度统一且不带隐私信息。

### 到期前提醒：把"突然不能用"变成"提前打招呼"

直接到期锁死容易把关系搞僵。建议在日期检查那里留个缓冲：到期前 14 天开始，启动时打印一行醒目的提示；到期日当天依然放行，次日才停。客户体验好了，尾款沟通反而更顺——毕竟你早在两周前就提醒过了。

### 密钥保管与补灾

- **私钥丢失**：无法再给现有程序签发任何 license，只能换新密钥对并重新交付程序。所以 `license.pem` 生成后立刻备份（密码管理器 + 离线一份）。
- **私钥泄露**：怀疑泄露就立刻重新生成密钥对、替换程序里的公钥、重新编译交付（配合"一个项目一对密钥"，损失被圈定在单个项目内）。
- **日常纪律**：`.gitignore` 屏蔽 `*.pem`，交付前检查产物里没有 `license.pem` 和签发工具。

## 局限性：诚实面对这套方案的边界

::: warning 不要高估这把锁
程序编译成二进制后，验证逻辑和公钥仍然存在于产物中。决心足够强的逆向者可以定位并修改验证分支（把 `verify` 的结果硬改成通过），这类对抗属于逆向工程与代码混淆的范畴，不在本文讨论之列。签名方案的价值在于：

1. ==抬高篡改门槛==——改配置、改文件、改日期统统失效，必须上专业工具；
2. ==留下证据==——license 里写着客户名，一旦流出可以直接对账；
3. ==掌握主动权==——续不续期、给谁续期，钥匙在你手里。

多数商业纠纷卡在"懒得折腾"这一层就结束了，这把锁处理的正是这一层。
:::

## 总结

整套方案回顾下来只有四句口诀：

::: card title="四句话记住它" icon="twemoji:memo"
1. 密钥 openssl 一条命令生成，私钥自己留，公钥编进程序里；
2. 签发工具一份 Python 就够，license 格式三语言互通；
3. 启动时先验签、再查日期，时间存疑就联网校时；
4. 尾款到账，签一张长期的发过去。

:::

如果你确实需要用 Go / Rust 原生写签发端，核心 API 对照如下：

| 能力 | Python（cryptography） | Go（标准库） | Rust（ed25519-dalek） |
| :-- | :-- | :-- | :-- |
| 签名 | `key.sign(payload)` | `ed25519.Sign(priv, payload)` | `sk.sign(&payload)` |
| 验证 | `pk.verify(sig, payload)`（失败抛异常） | `ed25519.Verify(pub, payload, sig)`（返回 bool） | `vk.verify(&payload, &sig)?` |
| 三方依赖 | cryptography | 无 | ed25519-dalek 等 |
| 交付形态 | Nuitka onefile exe | 原生二进制 | cargo build --release |

（密钥生成统一走第 0 步的 openssl，三种语言不需要各自的 keygen 代码。）

最后再强调一次：==技术方案是筹码，合同才是根本==。签名认证让你在尾款谈判桌上始终握有一张牌，但把项目边界、验收标准、付款节点写清楚，才是接外包最重要的护身符。
