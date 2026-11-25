---
title: Shell 脚本编写指南：sh 与 bash 写法对照与命令速查
createTime: 2026/11/25 10:42:03
tags: [linux, shell, bash, 脚本]
permalink: /blog/lzank7gk/
---

## 一、先分清 sh 与 bash {#sh-vs-bash}

`sh` 不是某一个具体程序，而是 POSIX 规定的命令语言接口；`bash` 是它的超集实现之一。Linux 上 `/bin/sh` 通常是 **dash**（Debian/Ubuntu）或 bash 的 POSIX 模式；macOS 上 `/bin/sh` 仍是 **bash 3.2 的 POSIX 模式**。本机实测：

```sh title="check-shell.sh"
ls -l /bin/sh
/bin/sh -c 'printf "sh0=%s bashver=%s\n" "$0" "${BASH_VERSION:-not-bash}"'
command -v dash bash
```

写 `#!/bin/sh` 就要按 POSIX 写，不能把 bash 扩展混进去；写 `#!/usr/bin/env bash` 才可以使用 bash 扩展，但要接受 macOS 自带 bash 只有 3.2 的事实。

### shebang 与执行方式

| 写法 / 命令 | 由谁解释 | 是否读 shebang | 说明 |
| :-- | :-- | :-- | :-- |
| `#!/bin/sh` | 系统的 sh | 是 | 最保守；Debian/Ubuntu 多为 dash，macOS 为 bash 3.2 |
| `#!/bin/bash` | `/bin/bash` | 是 | Linux 常见 4.x/5.x；macOS 固定 3.2 |
| `#!/usr/bin/env bash` | PATH 中第一个 bash | 是 | Homebrew、Git Bash 环境更稳；CI 要注意 PATH |
| `#!/usr/bin/env sh` | PATH 中第一个 sh | 是 | 通常仍是 dash 或 bash |
| `sh script.sh` | `/bin/sh` | **否** | 明确用系统的 sh 跑，脚本里的 bash 写法会报错 |
| `bash script.sh` | bash | **否** | 即使 shebang 写的是 sh，也用 bash 解释 |
| `dash script.sh` | dash | **否** | 验证 POSIX 兼容性最直接 |
| `./script.sh` | 内核按 shebang 启动 | 是 | 需要 `chmod +x`；shebang 路径必须存在 |
| `. script.sh` / `source script.sh` | 当前 shell | **否** | 不新建进程，变量、函数、`cd` 会影响当前 shell |

执行方式的核心区别：

- `sh script.sh` 与 `bash script.sh` 都是**新建子进程**，父 shell 的变量不受影响。
- `./script.sh` 依赖 shebang，且要求可执行权限；`sh script.sh` 不要求可执行权限。
- `.` 是 POSIX 写法，`source` 是 bash/ksh 的别名；dash 只有 `.`。
- 被 `source` 的脚本里执行 `exit` 会退出当前 shell，不是只退出脚本。

### bash 3.2 的能力边界

macOS 自带 `/bin/bash` 是 3.2.57，不是 Homebrew 的 5.x。下面这些写法在 3.2 上不可用，写 macOS 兼容脚本时不要假设它们存在：

| 特性 | bash 3.2 | 替代做法 |
| :-- | :-- | :-- |
| 关联数组 `declare -A` | 不支持 | 两个索引数组，或 `case` 分支 |
| `mapfile` / `readarray` | 没有该命令 | `while IFS= read -r line` |
| `${var,,}` / `${var^^}` | 报 `bad substitution` | `tr '[:upper:]' '[:lower:]'` |
| `&>>` | 语法错误 | `>> file 2>&1` |
| `\|&` | 语法错误 | `2>&1 \|` |
| `wait -n` | 不支持 | 记录每个 `$!` 后逐个 `wait` |
| `BASHPID` | 未定义 | `$$`（子 shell 中值不同，注意语义） |
| `EPOCHSECONDS` | 未定义 | `date +%s` |
| `globstar` / `**` | 没有该 shopt | `find` |
| `;&` / `;;&` | 语法错误 | 拆分 `case` 或改用 `if` |
| `${var@Q}` | 报 `bad substitution` | `printf '%q' "$var"` |
| `declare -g` | 不支持 | 在函数里直接给全局变量赋值 |

bash 3.2 仍然支持索引数组、`[[ ... ]]`、`=~` 与 `BASH_REMATCH`、`<<<`、进程替换、`local`、`$RANDOM`、`$SECONDS`、`$LINENO`、`$PIPESTATUS`、`set -o pipefail`。真正需要 4.x/5.x 的写法会在下文单独标注。

::: warning `bash --posix` 不能代替 dash

`bash --posix script.sh` 只是让 bash 更接近 POSIX 行为，bash 扩展仍然存在，某些边界行为也和 dash 不同。要验证 `#!/bin/sh` 脚本，直接用 `dash -n script.sh` 和 `dash script.sh`；不要用 `bash --posix` 跑一遍就认为兼容。

:::

外部命令也有 GNU 与 BSD 两套实现。macOS 默认是 BSD 工具，Linux 多为 GNU coreutils；`sed -i`、`date -d`、`stat -c` 这类写法不能互抄，详见[第六章](#text)。

## 二、脚本骨架与执行 {#skeleton}

::: steps

1. **创建文件并写 shebang**

   ```sh title="hello.sh"
   #!/bin/sh
   set -eu

   name=${1:-world}
   printf 'hello, %s\n' "$name"
   ```

2. **加执行权限**

   ```sh title="chmod.sh"
   chmod +x hello.sh
   ```

3. **分别用直接执行、sh、bash 运行**

   ```sh title="run.sh"
   ./hello.sh Alice
   sh hello.sh Bob
   bash hello.sh Carol
   ```

4. **先做语法检查，再运行**

   ```sh title="syntax-check.sh"
   sh -n hello.sh
   dash -n hello.sh
   bash -n hello.sh
   ```

   `-n` 只解析不执行，能发现括号、引号、`fi`/`done` 缺失这类问题，但发现不了运行时错误。

5. **需要看执行轨迹时加 `-x`**

   ```sh title="debug.sh"
   sh -x hello.sh Alice
   bash -x hello.sh Bob
   ```

   `-x` 会把展开后的命令打印到 stderr；脚本里临时加 `set -x` / `set +x` 可以只跟踪一段。

:::

一个最小但完整的脚本应当包含：shebang、严格模式、参数默认值、`usage`、主流程。后面的[健壮性](#robust)会给出一份可直接改的模板。

## 三、特殊变量与内置变量 {#variables}

### 位置参数与进程状态

| 变量 | 含义 | sh | bash | 备注 |
| :-- | :-- | :-: | :-: | :-- |
| `$0` | 脚本名或当前 shell 名 | 是 | 是 | 被 `source` 时仍是调用者的 `$0` |
| `$1` … `$9` | 第 1～9 个位置参数 | 是 | 是 | 超过 9 个必须写 `${10}` |
| `${10}` | 第 10 个位置参数 | 是 | 是 | `$10` 会被解析成 `$1` 加字符 `0` |
| `$#` | 位置参数个数 | 是 | 是 | 不包含 `$0` |
| `$@` | 所有位置参数 | 是 | 是 | 不加引号会发生分词与通配 |
| `$*` | 所有位置参数 | 是 | 是 | 不加引号同样分词；受 `IFS` 影响 |
| `"$@"` | 每个参数保持独立 | 是 | 是 | 传参给函数/子命令时优先使用 |
| `"$*"` | 所有参数拼成一个字符串 | 是 | 是 | 用 `IFS` 的第一个字符连接 |
| `$?` | 上一条命令的退出状态 | 是 | 是 | 0 表示成功，1～255 表示失败 |
| `$$` | 当前 shell 的 PID | 是 | 是 | 子 shell 中通常仍是父 shell 的 PID |
| `$!` | 最近一个后台进程的 PID | 是 | 是 | 配合 `wait` 使用 |
| `$-` | 当前 shell 的选项标志 | 是 | 是 | 可用来判断是否开启了 `-x` 等 |

`"$@"` 与 `"$*"` 的差别只在带引号时最明显：

```sh title="args.sh"
#!/bin/sh
show_at() {
  printf 'argc=%s\n' "$#"
  for arg in "$@"; do
    printf '[%s]\n' "$arg"
  done
}

show_star() {
  printf 'argc=%s\n' "$#"
  for arg in "$*"; do
    printf '[%s]\n' "$arg"
  done
}

show_at "a b" c
show_star "a b" c

# 第 10 个参数必须写 ${10}；$10 等于 $1 后面跟一个 0。
set -- one two three four five six seven eight nine ten
printf 'tenth=%s\n' "${10}"
```

`show_at` 得到两个参数；`show_star` 把两个参数拼成 `a b c`，再按空格分成三个。需要原样传递参数时，始终写 `"$@"`。

### bash 扩展变量

表里大部分是 bash 扩展；少数项（如 `LINENO`）POSIX sh 也有，仍列在这里便于对照。

| 变量 | 含义 | sh | bash | 备注 |
| :-- | :-- | :-: | :-: | :-- |
| `BASH_SOURCE` | 当前脚本/函数的源文件路径数组 | 无 | 是 | `${BASH_SOURCE[0]}`；被 source 时指向库文件 |
| `LINENO` | 当前行号 | 是 | 是 | POSIX 变量，dash 支持 |
| `FUNCNAME` | 当前调用栈的函数名数组 | 无 | 是 | `${FUNCNAME[0]}` 是当前函数 |
| `PIPESTATUS` | 上一条管道的各段退出码数组 | 无 | 是 | 必须在管道后立刻读取 |
| `RANDOM` | 0～32767 的伪随机整数 | 无 | 是 | 赋值可设种子 |
| `SECONDS` | shell 启动后的秒数 | 无 | 是 | 赋值可重置计时 |
| `BASH_VERSION` | bash 版本字符串 | 无 | 是 | 判断 3.2 与 5.x |
| `BASH_REMATCH` | `[[ =~ ]]` 的捕获结果 | 无 | 是 | `[0]` 是整个匹配，`[1]` 起是分组 |
| `BASHPID` | 当前 bash 进程 PID | 无 | 4.0+ | 3.2 未定义 |
| `EPOCHSECONDS` | Unix 时间戳 | 无 | 5.0+ | 3.2 未定义 |
| `OSTYPE` | 平台标识 | 无 | 是 | 如 `darwin24`、`linux-gnu` |
| `EUID` | 有效 UID | 无 | 是 | 判断 root 更稳妥的是 `id -u` |

### 获取脚本所在目录

`$0` 只在“直接执行”时可靠；被 `source` 时它仍是调用者的名字。bash 用 `BASH_SOURCE[0]` 才能拿到库文件自身路径。

::: code-tabs

@tab:active sh

```sh title="script-dir.sh"
#!/bin/sh
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
printf 'script dir: %s\n' "$SCRIPT_DIR"
```

@tab bash

```bash title="script-dir.sh"
#!/usr/bin/env bash
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
printf 'script dir: %s\n' "$SCRIPT_DIR"
```

:::

路径带空格时，`CDPATH= cd -- ... && pwd` 这套写法是安全的；不要用 `cd $(dirname $0)`，分词会把空格拆开。

### 判断“被执行”还是“被 source”

bash 可以可靠判断：被执行时 `BASH_SOURCE[0]` 与 `$0` 相同，被 source 时不同。

```bash title="is-sourced.sh"
#!/usr/bin/env bash

is_sourced() {
  [[ ${BASH_SOURCE[0]} != "$0" ]]
}

if is_sourced; then
  printf 'sourced\n'
else
  printf 'executed\n'
fi
```

POSIX sh **没有可靠办法**在库文件内部判断自己是否被 source：`$0` 不会变成库文件路径。实际做法是：

- 库文件只定义函数，不执行主流程；
- 需要直接运行库文件做自测时，约定一个显式参数，例如 `--self-test`；
- 不要在 sh 库里依赖 `$0` 推算自身目录。

一个常见的 sh 启发式是检查 `$0` 的 basename，但它只能覆盖“直接执行”与“从同名 shell 交互执行”两种情况，不能当成通用判断：

```sh title="caller-check.sh"
#!/bin/sh
main() {
  printf 'main: %s\n' "$*"
}

if [ "${0##*/}" = "caller-check.sh" ]; then
  main "$@"
fi
```

### 被 source 时 `$0` 的坑

```sh title="lib.sh"
#!/bin/sh
greet() {
  printf 'hello, %s\n' "$1"
}

printf 'lib sees $0=%s\n' "$0"
```

```sh title="use-lib.sh"
#!/bin/sh
. ./lib.sh
greet world
```

运行 `sh use-lib.sh` 时，`lib.sh` 里打印的 `$0` 是 `use-lib.sh`，不是 `lib.sh`。因此库文件里不要用 `$0` 定位自己的配置文件、资源目录；需要路径时由调用方传入，或改用 bash 的 `BASH_SOURCE`。

## 四、基础语法 {#syntax}

### 变量、引号与命令替换

下面写法 sh 与 bash 完全一致：

```sh title="quotes.sh"
#!/bin/sh
name='world'
greeting="hello, $name"
printf '%s\n' "$greeting"
printf '%s\n' 'single: $name 不展开'
printf '%s\n' "double: $name 会展开"

out=$(printf 'a\nb\n')
printf '%s\n' "$out"

count=1
count=$((count + 1))
printf 'count=%s\n' "$count"
```

规则：

- 赋值等号两边不能有空格：`name=value`，不是 `name = value`。
- 单引号内一切都是字面量；双引号内展开 `$`、`$(...)`、反引号和反斜杠。
- 变量用于命令参数时加双引号：`"$file"`。不加引号会分词，还会把 `*`、`?` 当通配符展开。
- 命令替换用 `$(...)`，可嵌套；反引号是旧写法，嵌套困难，不推荐。
- `$'...'` 是 ANSI-C 引用，bash/ksh 支持；POSIX.1-2024 已纳入，但 dash 等实现仍不支持，跨 shell 脚本不要用。

### 字符串操作

POSIX sh 支持长度、前后缀删除和默认值；子串截取、全局替换、大小写转换是 bash 扩展。

::: code-tabs

@tab:active sh

```sh title="strings.sh"
#!/bin/sh
v='dir/file.tar.gz'
printf 'len=%s\n' "${#v}"
printf 'base=%s\n' "${v##*/}"
printf 'dir=%s\n' "${v%/*}"
printf 'noext=%s\n' "${v%.*}"
printf 'suffix=%s\n' "${v##*.}"
printf 'default=%s\n' "${unset_var:-fallback}"
printf 'assign=%s\n' "${tmp:=filled}"
printf 'alt=%s\n' "${v:+set}"
```

@tab bash

```bash title="strings-bash.sh"
#!/usr/bin/env bash
v='dir/file.tar.gz'
printf 'substr=%s\n' "${v:4:4}"
printf 'replace=%s\n' "${v/file/FILE}"
printf 'replace-all=%s\n' "${v//./_}"
name=v
printf 'indirect=%s\n' "${!name}"
```

:::

`${v:4:4}`、`${v/file/FILE}`、`${v//./_}` 都是 bash 扩展，dash 会报 `Bad substitution`。`${!name}` 是间接展开，同样不是 POSIX。

bash 4+ 还支持大小写转换；macOS 自带 3.2 不支持：

```bash title="case-convert-bash4.sh"
#!/usr/bin/env bash
v='AbC'
printf 'lower=%s\n' "${v,,}"
printf 'upper=%s\n' "${v^^}"
```

### 算术

`$((...))` 是 POSIX 写法；`((...))`、`let` 和 C 风格 `for` 是 bash/ksh 扩展。shell 算术只处理整数，除法向零截断。

::: code-tabs

@tab:active sh

```sh title="arithmetic.sh"
#!/bin/sh
n=1
n=$((n + 1))
printf 'n=%s\n' "$n"

i=0
while [ "$i" -lt 3 ]; do
  i=$((i + 1))
done
printf 'i=%s\n' "$i"
printf 'expr=%s\n' "$(( (3 + 4) * 2 ))"
```

@tab bash

```bash title="arithmetic-bash.sh"
#!/usr/bin/env bash
n=1
((n++))
((n += 2))
printf 'n=%s\n' "$n"

for ((i = 0; i < 3; i++)); do
  printf 'i=%s\n' "$i"
done
```

:::

注意 `08` 这类带前导零的字面量在算术中会被当成八进制，`08` 直接报错；需要十进制时写 `10#08`（bash/ksh 支持，dash 不支持 `10#` 前缀）。

### 数组

POSIX sh 没有数组。需要一组值时，用位置参数、换行分隔的字符串，或直接换用 bash。

::: code-tabs

@tab:active sh

```sh title="no-arrays.sh"
#!/bin/sh
set -- alpha beta gamma
for item in "$@"; do
  printf '%s\n' "$item"
done
```

@tab bash

```bash title="arrays.sh"
#!/usr/bin/env bash
arr=(alpha beta gamma)
arr+=(delta)
printf 'len=%s\n' "${#arr[@]}"
printf 'second=%s\n' "${arr[1]}"
printf 'all=%s\n' "${arr[*]}"
for item in "${arr[@]}"; do
  printf '<%s>\n' "$item"
done
unset 'arr[1]'
printf 'keys=%s\n' "${!arr[@]}"
```

:::

关联数组要 bash 4+，macOS 3.2 会报 `declare: -A: invalid option`：

```bash title="assoc-bash4.sh"
#!/usr/bin/env bash
declare -A color=([red]='#f00' [green]='#0f0')
printf 'red=%s\n' "${color[red]}"
```

### test、`[ ]` 与 `[[ ]]`

`[` 是命令（`test` 的别名），POSIX；`[[ ]]` 是 bash/ksh 语法。`[ ]` 里变量必须加引号，`[[ ]]` 里不做分词和通配展开，可以安全写 `[[ -f $file ]]`。

::: code-tabs

@tab:active sh

```sh title="test.sh"
#!/bin/sh
file=/etc/hosts
if [ -f "$file" ]; then
  printf 'file exists\n'
fi

value=''
if [ -z "$value" ]; then
  printf 'empty\n'
fi

if [ "$value" = '' ] && [ "$(id -u)" -ne 0 ]; then
  printf 'non-root\n'
fi
```

@tab bash

```bash title="test-bash.sh"
#!/usr/bin/env bash
file=/etc/hosts
if [[ -f $file && $file == /etc/* ]]; then
  printf 'match\n'
fi

if [[ $file == */hosts ]]; then
  printf 'wildcard match\n'
fi

s='abc-123'
if [[ $s =~ ^([a-z]+)-([0-9]+)$ ]]; then
  printf 'word=%s number=%s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
fi
```

:::

`[[ ]]` 的正则右侧不要加引号；加了引号就变成字面量匹配。`[ ]` 不要用 `-a` / `-o` 连接复杂条件，改用 `&&` / `||` 分成多个 `[ ]`。

### if、case 与循环

`if`、`case`、`for`、`while`、`until`、`break`、`continue` 在 sh 与 bash 中语法一致。下面只列 bash 扩展部分。

```sh title="loops.sh"
#!/bin/sh
for name in alpha beta; do
  printf 'for=%s\n' "$name"
done

i=0
while [ "$i" -lt 2 ]; do
  i=$((i + 1))
  [ "$i" -eq 1 ] && continue
  printf 'while=%s\n' "$i"
done

j=0
until [ "$j" -ge 2 ]; do
  j=$((j + 1))
  printf 'until=%s\n' "$j"
done

for x in 1 2 3; do
  for y in a b; do
    [ "$y" = b ] && break 2
  done
  printf 'unreachable: %s\n' "$x"
done
printf 'nested break done\n'
```

bash 的 `case` 支持 `;&`（继续执行下一个分支）和 `;;&`（继续匹配后续模式），但 **bash 4+** 才有，3.2 会语法错误。需要兼容 3.2 时用 `if` 或拆成多个 `case`。

```bash title="case-bash4.sh"
#!/usr/bin/env bash
mode=${1:-start}
case $mode in
  start) printf 'start\n' ;&
  run) printf 'run\n' ;;
  *) printf 'other\n' ;;
esac
```

### 函数与返回值

函数返回值是 0～255 的退出状态，不是任意字符串。需要返回字符串时，用 `printf` 输出，再在调用处 `$(...)` 捕获。

::: code-tabs

@tab:active sh

```sh title="functions.sh"
#!/bin/sh
log() {
  level=$1
  shift
  printf '[%s] %s\n' "$level" "$*" >&2
}

add() {
  printf '%s\n' "$(($1 + $2))"
}

fail() {
  return 1
}

log INFO 'starting'
sum=$(add 2 3)
printf 'sum=%s\n' "$sum"

if fail; then
  printf 'unexpected\n'
else
  printf 'fail returned %s\n' "$?"
fi
```

@tab bash

```bash title="functions-bash.sh"
#!/usr/bin/env bash
f() {
  local a=1 b=2
  printf '%s\n' "$((a + b))"
}

g() {
  local -r name='fixed'
  printf '%s\n' "$name"
}

f
g
```

:::

`local` 不是 POSIX 必需项，但 dash 和 bash 都支持；要在所有 POSIX shell 上跑，就把变量名加前缀避免冲突。`local -r` 是 bash 扩展。

### read 读取输入

POSIX `read` 只保证 `-r`。`-p`、`-t`、`-n` 是 bash 扩展；sh 脚本用 `printf` 先输出提示。

::: code-tabs

@tab:active sh

```sh title="read.sh"
#!/bin/sh
printf 'name: '
IFS= read -r name
printf 'hello, %s\n' "$name"

while IFS= read -r line; do
  printf 'line=<%s>\n' "$line"
done <<'EOF'
first line
second line
EOF
```

@tab bash

```bash title="read-bash.sh"
#!/usr/bin/env bash
read -r -p 'name: ' name
printf 'hello, %s\n' "$name"

if read -r -t 2 -n 1 key; then
  printf 'key=%s\n' "$key"
fi
```

:::

`IFS= read -r line` 不会吞掉行首尾空格，也不会把反斜杠当转义。遍历文件时用 `while ... done < file`，不要用 `for line in $(cat file)`。

### 重定向与管道

`>`、`>>`、`2>`、`2>&1`、`<`、`<<`、`exec 3>` 都是 POSIX。`&>`、`&>>`、`<<<`、进程替换 `<(...)` 是 bash 扩展；其中 `&>>` 还要 bash 4+。

::: code-tabs

@tab:active sh

```sh title="redirect.sh"
#!/bin/sh
tmp=${TMPDIR:-/tmp}/redirect.$$
trap 'rm -f "$tmp"' EXIT

printf 'out\n' > "$tmp"
printf 'append\n' >> "$tmp"
cat < "$tmp"

{ printf 'grouped\n'; printf 'stderr\n' >&2; } > "$tmp" 2>&1
printf 'after grouping: '
cat "$tmp"

exec 3> "$tmp"
printf 'fd3\n' >&3
exec 3>&-
printf 'done\n'
```

@tab bash

```bash title="redirect-bash.sh"
#!/usr/bin/env bash
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT

printf 'out\n' &> "$tmp"
printf 'err\n' >> "$tmp" 2>&1
cat "$tmp"

cat <<< 'here-string'
diff <(printf 'a\n') <(printf 'a\n') && printf 'same\n'
```

:::

`2>&1` 的顺序很重要：`cmd >file 2>&1` 把 stdout 和 stderr 都写入文件；`cmd 2>&1 >file` 只把 stdout 写入文件，stderr 仍去终端。`{ ...; } >file` 在当前 shell 执行，`( ... ) >file` 在子 shell 执行，后者里的变量修改不会带回。

### Here-Doc

```sh title="heredoc.sh"
#!/bin/sh
name='world'
cat <<EOF
hello, $name
literal \$name
EOF

cat <<'EOF'
no expansion: $name
EOF
```

- 分隔符不加引号时，`$变量`、`$(命令)` 会展开；加引号（`<<'EOF'`）时原样输出。
- `<<-EOF` 只删除行首的 **Tab**，不删除空格；脚本缩进用空格时不要指望它。
- Here-Doc 的内容从下一行开始，结束分隔符必须单独占一行，前后不能有空格。

## 五、健壮性 {#robust}

### `set -euo pipefail`

- `set -e`：命令失败立即退出。它在 `if`、`while`、`&&`、`||`、`!` 的条件位置不触发，函数和子 shell 里也有细节差异，不能代替显式错误处理。
- `set -u`：引用未定义变量时报错退出。注意 `${var:-default}` 和 `${1:-}` 是安全的。
- `set -o pipefail`：管道中任意一段失败，整条管道返回非零。**POSIX sh/dash 不支持**；bash/ksh 支持。

::: code-tabs

@tab:active sh

```sh title="strict-sh.sh"
#!/bin/sh
set -eu

# dash 没有 pipefail；需要判断管道结果时写成显式分支。
if printf 'x\n' | grep -q y; then
  printf 'found\n'
else
  printf 'not found\n'
fi
```

@tab bash

```bash title="strict-bash.sh"
#!/usr/bin/env bash
set -euo pipefail

if printf 'x\n' | grep -q y; then
  printf 'found\n'
else
  printf 'not found\n'
fi
```

:::

::: warning `set -e` 的三个常见误判

1. `cmd1 && cmd2` 中 `cmd1` 失败不会退出，因为它在条件位置；
2. `if ! cmd; then ... fi` 里 `cmd` 失败也不会退出；
3. 命令替换的失败是否触发退出取决于写法：`o=$(false)` 会退出；`local o=$(false)` 不会，因为 `local` 自身的返回 0 覆盖了赋值状态；`echo "x $(false)"` 也不会，因为失败发生在参数展开里，命令本身仍然成功。

需要保留命令替换的退出码时，先声明再赋值：`local o; o=$(cmd)`，并显式检查 `$?`。

:::

### trap 清理

`trap` 用来在退出或收到信号时清理临时文件、子进程。`EXIT` 和 `0` 是等价的 trap 条件；POSIX trap 同时接受两者，dash、bash 也都支持。

```sh title="trap.sh"
#!/bin/sh
set -eu

tmpdir=$(mktemp -d "${TMPDIR:-/tmp}/trap.XXXXXX")
cleanup() {
  status=$?
  rm -rf "$tmpdir"
  printf 'cleanup, status=%s\n' "$status" >&2
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

printf 'work in %s\n' "$tmpdir"
sleep 0.2
```

正确结构是：INT/TERM 的 trap 只负责 `exit 130` / `exit 143`，不直接调用清理函数；真正的清理统一放在 EXIT trap 里，这样不会重复执行。EXIT trap 的第一行先保存 `$?`，再清理，最后按保存的状态退出（或让 EXIT trap 自然结束以保留原状态）。

### getopts 解析参数

`getopts` 是 POSIX 内置命令，sh/bash 都能用。选项字符串开头的 `:` 表示“静默模式”，错误信息由脚本自己输出。

```sh title="getopts.sh"
#!/bin/sh
set -eu

usage() {
  printf 'usage: %s [-v] [-o FILE] ARG...\n' "${0##*/}" >&2
  exit 2
}

verbose=0
outfile=''
while getopts ':vo:' opt; do
  case $opt in
    v) verbose=1 ;;
    o) outfile=$OPTARG ;;
    :) printf 'missing argument for -%s\n' "$OPTARG" >&2; usage ;;
    \?) printf 'unknown option: -%s\n' "$OPTARG" >&2; usage ;;
  esac
done
shift $((OPTIND - 1))

printf 'verbose=%s outfile=%s rest=%s\n' "$verbose" "$outfile" "$*"
```

`OPTIND` 在同一 shell 中不会自动重置；如果函数里反复解析参数，先 `OPTIND=1`。

### 日志函数

```sh title="log.sh"
#!/bin/sh
log() {
  level=$1
  shift
  printf '%s [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$level" "$*" >&2
}

log INFO 'start'
log ERROR 'failed'
```

日志写 stderr，避免污染 stdout 的数据管道；需要同时落盘时用 `exec 2> >(tee -a app.log >&2)`（bash 进程替换）或 `2>>app.log`。

### 完整模板：sh 版

```sh title="template.sh"
#!/bin/sh
set -eu

usage() {
  printf 'usage: %s [-n] [-o FILE] ARG...\n' "${0##*/}" >&2
  exit 2
}

cleanup() {
  status=$?
  if [ -n "${tmpdir:-}" ]; then
    rm -rf "$tmpdir"
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

dry_run=0
outfile=''
while getopts ':no:' opt; do
  case $opt in
    n) dry_run=1 ;;
    o) outfile=$OPTARG ;;
    :) printf 'missing argument for -%s\n' "$OPTARG" >&2; usage ;;
    \?) usage ;;
  esac
done
shift $((OPTIND - 1))
[ "$#" -gt 0 ] || usage

tmpdir=$(mktemp -d "${TMPDIR:-/tmp}/template.XXXXXX")
for arg in "$@"; do
  printf 'arg=%s\n' "$arg"
done

if [ "$dry_run" -eq 1 ]; then
  printf 'dry-run: skip writing\n'
else
  printf 'writing to %s\n' "${outfile:-stdout}" >&2
fi
```

### 完整模板：bash 版

```bash title="template-bash.sh"
#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'usage: %s [-n] [-o FILE] ARG...\n' "${0##*/}" >&2
  exit 2
}

cleanup() {
  local status=$?
  if [[ -n ${tmpdir:-} ]]; then
    rm -rf "$tmpdir"
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

dry_run=0
outfile=''
while getopts ':no:' opt; do
  case $opt in
    n) dry_run=1 ;;
    o) outfile=$OPTARG ;;
    :) printf 'missing argument for -%s\n' "$OPTARG" >&2; usage ;;
    \?) usage ;;
  esac
done
shift $((OPTIND - 1))
(( $# > 0 )) || usage

tmpdir=$(mktemp -d "${TMPDIR:-/tmp}/template.XXXXXX")
for arg in "$@"; do
  printf 'arg=%s\n' "$arg"
done

if (( dry_run )); then
  printf 'dry-run: skip writing\n'
else
  printf 'writing to %s\n' "${outfile:-stdout}" >&2
fi
```

## 六、文本与文件处理 {#text}

这一节默认在目标目录执行。文件名、字段数量、编码都按简单文本处理；需要复杂解析时用 [awk 速查与实战](/blog/41sm1igd/) 或 [正则表达式速查手册](/blog/1kb2ui6m/)。

### find 与 xargs

```sh title="find.sh"
#!/bin/sh
set -eu
find . -type f -name '*.sh' -print
find . -type f -mtime -1 -print
find . -type f -name '*.tmp' -exec rm -f {} +
find . -type f -print0 | xargs -0 wc -l
```

- `-exec cmd {} +` 把多个文件合并成少量调用，比每个文件一次 `-exec ... \;` 快。
- `-print0` + `xargs -0` 解决文件名含空格、换行的问题；`-print0` / `xargs -0` 已纳入 POSIX.1-2024，但旧系统未必支持；GNU find 与 macOS find 都支持。
- 删除前先 `-print` 预览；`-delete` 不可恢复。

```sh title="xargs.sh"
#!/bin/sh
set -eu
printf 'a\nb\n' | xargs -n 1 printf '<%s>\n'
printf 'a\000b\000' | xargs -0 -n 1 printf '<%s>\n'
printf '1\n2\n3\n' | xargs -P 3 -n 1 sh -c 'printf "job %s\n" "$1"' _
```

GNU xargs 的 `-r`（空输入不执行）在部分 BSD/macOS 版本上不可用或行为不同；移植脚本时用 `find -exec`，或先判断输入是否为空。`-P` 表示并行度，macOS 和 GNU 都支持，但并行输出会交错。

### grep

```sh title="grep.sh"
#!/bin/sh
grep -n 'error' app.log
grep -r --include='*.sh' -n 'set -e' .
grep -E '^(ERROR|WARN)' app.log
grep -F 'a.b' app.log
grep -ci 'error' app.log
```

- `-E` 是扩展正则，POSIX；`-P` 是 Perl 正则，GNU grep 专有，macOS 的 BSD grep 不认。
- `-F` 按固定字符串匹配，查含 `.`、`*` 的字面量时更安全。
- `-r --include` 是 GNU/BSD 扩展，严格 POSIX 没有；可移植写法是 `find ... -exec grep ... {} +`。
- `grep -q` 只关心是否有匹配，适合放进 `if`。

### sed

```sh title="sed.sh"
#!/bin/sh
set -eu
sed -n '1,3p' file.txt
sed 's/old/new/g' file.txt > file.new
sed -E 's/([a-z]+)-([0-9]+)/\2:\1/' file.txt

# 就地修改的可移植写法：先写临时文件，再替换。
tmp=$(mktemp)
sed 's/old/new/g' file.txt > "$tmp" && mv "$tmp" file.txt
```

GNU sed 的 `sed -i 's/old/new/' file` 在 macOS BSD sed 上会报错，必须写 `sed -i '' 's/old/new/' file`。跨平台脚本不要用 `-i`，用上面的临时文件写法。

### sort、uniq、cut、tr、tee、wc

```sh title="text-pipeline.sh"
#!/bin/sh
set -eu
printf 'b 2\na 1\na 1\n' | sort -k1,1
printf 'b\na\na\n' | sort | uniq -c
printf 'a:b:c\n' | cut -d: -f1,3
printf 'abc\n' | tr 'a-z' 'A-Z'
printf 'x\ny\n' | tee "${TMPDIR:-/tmp}/tee.out" | wc -l
```

- `uniq` 只合并相邻重复行，先 `sort` 再 `uniq`。
- `cut -d` 只支持单字符分隔符；多字符或连续分隔符用 awk。
- `tr` 按字符处理，不做字符串替换；删除字符用 `tr -d`，压缩重复用 `tr -s`。
- `tee` 同时写文件和 stdout；追加用 `tee -a`。
- `wc -l` 数行数，`-w` 数词，`-c` 数字节，`-m` 数字符。

### GNU 与 BSD 差异

| 任务 | GNU/Linux | macOS BSD | 可移植写法 |
| :-- | :-- | :-- | :-- |
| 就地编辑 | `sed -i 's/a/b/' f` | `sed -i '' 's/a/b/' f` | 临时文件 + `mv` |
| 日期加减 | `date -d '1 day ago'` | `date -v-1d` | `perl -e 'print scalar localtime(time-86400)'` |
| 文件大小 | `stat -c %s f` | `stat -f %z f` | `wc -c < f` |
| 真实路径 | `readlink -f f` | 新版有，老版无 | `cd "$(dirname "$f")" && pwd -P` |
| Perl 正则 | `grep -P` | 不支持 | `grep -E` 或 `perl` |
| find 格式化 | `find -printf` | 不支持 | `find -exec printf ... {} +` |
| 超时命令 | `timeout 5 cmd` | 没有 | 后台进程 + `sleep` + `kill` |
| Base64 不换行 | `base64 -w0` | 没有 `-w` | `base64 \| tr -d '\n'` |
| SHA-256 | `sha256sum f` | `shasum -a 256 f` | `openssl dgst -sha256 f` |
| 空输入不执行 | `xargs -r` | 版本差异 | `find -exec` 或先判空 |
| 版本排序 | `sort -V` | 新版有，非 POSIX | `sort -n` / `awk` 拆分 |

## 七、进程与系统 {#process}

### 后台任务与 wait

```sh title="background.sh"
#!/bin/sh
set -eu
sleep 0.2 &
pid=$!
printf 'started pid=%s\n' "$pid"
wait "$pid"
printf 'done status=%s\n' "$?"
```

`$!` 是最近一个后台进程的 PID；`wait` 等待它结束并返回其退出状态。多个后台任务要分别保存 PID，再逐个 `wait`：

```sh title="parallel.sh"
#!/bin/sh
set -eu
pids=''
for n in 1 2 3; do
  (sleep 0.1; printf 'job %s\n' "$n") &
  pids="$pids $!"
done
for pid in $pids; do
  wait "$pid"
done
printf 'all done\n'
```

也可以用 `xargs -P` 控制并发；只要有一个子命令失败，xargs 整体就返回非零（GNU 常见 123，BSD/macOS 可能是 1），不要依赖具体数值，只判断 `$?` 是否非零。并行时各任务的输出会交错，日志里要带上任务标识。

```sh title="xargs-parallel.sh"
#!/bin/sh
set -eu
printf '1\n2\n3\n' | xargs -P 3 -n 1 sh -c 'printf "job %s\n" "$1"' _
```

### timeout

GNU coreutils 提供 `timeout`；macOS 默认没有，Homebrew 安装 coreutils 后命令名通常是 `gtimeout`。可移植写法：

```sh title="timeout.sh"
#!/bin/sh
set -eu
if command -v timeout >/dev/null 2>&1; then
  timeout 2 sleep 10 || printf 'timed out\n'
else
  sleep 10 &
  pid=$!
  (sleep 2; kill -TERM "$pid" 2>/dev/null) &
  watcher=$!
  wait "$pid" 2>/dev/null || printf 'timed out\n'
  kill "$watcher" 2>/dev/null || true
  wait "$watcher" 2>/dev/null || true
fi
```

后台 + `sleep` + `kill` 的版本只能保证“到点发信号”，不保证进程一定在 2 秒内退出；需要强杀时再补 `kill -KILL`。

### 检测系统、命令与权限

```sh title="os-detect.sh"
#!/bin/sh
set -eu
case $(uname -s) in
  Darwin) os=macos ;;
  Linux) os=linux ;;
  *) os=unknown ;;
esac
printf 'os=%s arch=%s\n' "$os" "$(uname -m)"
```

```sh title="preflight.sh"
#!/bin/sh
set -eu
for cmd in sh awk sed grep; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf 'missing: %s\n' "$cmd" >&2
    exit 1
  fi
done

if [ "$(id -u)" -eq 0 ]; then
  printf 'running as root\n'
else
  printf 'running as user %s\n' "$(id -un)"
fi
```

用 `command -v` 判断命令是否存在；`which` 不是 POSIX，且在不同 shell 里行为不一致。判断 root 用 `id -u`，不要依赖 bash 的 `$EUID`。

### cron 示例

```text title="crontab-example.txt"
SHELL=/bin/sh
PATH=/usr/local/bin:/usr/bin:/bin

# 每天 03:30 执行；cron 的 PATH 很短，脚本和日志都写绝对路径。
30 3 * * * /Users/me/bin/backup.sh >> /Users/me/logs/backup.log 2>&1
```

cron 不会加载你的 `.zshrc` / `.bash_profile`，环境变量要显式写。macOS 还可以用 `launchd`；Linux 上要防止任务重叠时用 `flock`，macOS 默认没有 `flock`。

## 八、一行命令速查 {#cheatsheet}

### 文件与目录

| 场景 | 命令 |
| :-- | :-- |
| 建临时目录 | `tmpdir=$(mktemp -d "${TMPDIR:-/tmp}/work.XXXXXX")` |
| 复制目录 | `cp -a src/ dst/` |
| 查看目录大小 | `du -sh dir` |
| 找最近一天修改的文件 | `find . -type f -mtime -1 -print` |
| 打包 | `tar -czf archive.tar.gz dir/` |
| 解包 | `tar -xzf archive.tar.gz` |
| 同步目录 | `rsync -av --delete src/ dst/` |

### 文本

| 场景 | 命令 |
| :-- | :-- |
| 递归搜索 | `grep -RIn --include='*.sh' 'pattern' .` |
| 替换并输出 | `sed -E 's/old/new/g' file` |
| 取第一列 | `awk '{print $1}' file` |
| 去重计数 | `sort file \| uniq -c \| sort -nr` |
| 取路径文件名 | `basename /a/b/c.txt` |
| 取路径目录 | `dirname /a/b/c.txt` |
| 统计行数 | `wc -l file` |

### 网络与端口

| 场景 | 命令 |
| :-- | :-- |
| 下载文件 | `curl -fL -o out.zip https://example.com/out.zip` |
| 失败重试 | `curl -fL --retry 3 --retry-delay 2 -o out.zip URL` |
| 只看响应头 | `curl -fsSI https://example.com` |
| 查监听端口（macOS/Linux） | `lsof -nP -iTCP:8080 -sTCP:LISTEN` |
| 查监听端口（Linux） | `ss -lntp` |
| 测端口连通 | `nc -z -w 2 host 8080` |

### 进程

| 场景 | 命令 |
| :-- | :-- |
| 查进程 | `pgrep -fl nginx` |
| 结束进程 | `kill -TERM PID` |
| 强杀 | `kill -KILL PID` |
| 当前 shell 的任务 | `jobs -l` |
| 等后台任务 | `wait $!` |

### JSON 与彩色输出

| 场景 | 命令 |
| :-- | :-- |
| 取字段 | `jq -r '.name' data.json` |
| 断言字段存在 | `jq -e 'has("name")' data.json >/dev/null` |
| 合并数组 | `jq -s 'add' a.json b.json` |
| 红色输出 | `printf '\033[31m%s\033[0m\n' 'error'` |

### 批量重命名与日期

| 场景 | 命令 |
| :-- | :-- |
| 改扩展名 | `for f in *.jpg; do mv -- "$f" "${f%.jpg}.jpeg"; done` |
| 加前缀 | `for f in *.log; do mv -- "$f" "old-$f"; done` |
| 当前时间 | `date '+%Y-%m-%d %H:%M:%S'` |
| Unix 时间戳 | `date +%s` |

批量重命名先用 `printf '%s\n' "$f"` 预览，确认没有空格、通配符和同名冲突后再执行 `mv`。

## 九、对照 Windows {#windows}

Windows 下的 PowerShell 与 bat 写法见[Windows 脚本编写指南：PowerShell 与 bat 写法对照与命令速查](../windows/windows-script.md)。
