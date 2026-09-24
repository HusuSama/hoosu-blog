---
title: awk 速查与实战
createTime: 2026/05/18 10:00:00
permalink: /blog/41sm1igd/
tags:
  - linux
---

## 一、它是什么

`awk` 不是一条命令，而是一门**面向行的文本处理语言**——名字来自三位作者 Alfred **A**ho、Peter **W**einberger、Brian **K**ernighan 的姓氏首字母。它把"逐行读取、切分字段、判断条件、执行动作"这套流程固化成了语法，所以你只需要描述**规则**，循环和解析由它负责。

一条 awk 程序的基本形态就是若干组 `模式 { 动作 }`：

```awk
NR == 1        { print "这是表头" }     # 模式匹配行号
$3 > 100       { total += $3 }          # 模式匹配字段值
/error/        { print $0 }             # 模式的另一种写法：正则
END            { print total }          # 输入读完后执行
```

::: tip 为什么值得学
`grep` 只判断行是否匹配，`sed` 擅长同一行内替换，`cut` 只能按**固定**分隔符取列。awk 是这三者的超集功能再加上算术和哈希表，凡是"一边过滤、一边计算、一边重排"的活，它通常是最短的解法。
:::

### 三种被调用的方式

```bash
# ① 直接写程序（单引号包裹，最常用）
awk '{ print $1 }' file.txt

# ② 从脚本文件读程序，-f 可叠加多个文件
awk -f count.awk file.txt

# ③ 用 shebang 当成独立脚本
#!/usr/bin/awk -f
{ print NR, $0 }
```

> [!warning]
> **关于实现差异**
> 文中不通用之处会显式标注。判断标准是 **POSIX awk**（所有实现都该有）与 **gawk 扩展**（仅 GNU awk 有）。Debian/Ubuntu 默认的 `awk` 指向 **mawk**，它**没有** `gensub()`、`asort()`、`strtonum()`、`\s` `\y` 这类写法，照抄 gawk 脚本常在这种机器上翻车。

---

## 二、字段与记录模型

awk 把输入按**记录**（record，默认一行）读取，每条记录再按**分隔符**切成**字段**（field）。理解这两层是理解一切的前提。

| 写法 | 含义 | 通用性 |
| :-: | :-- | :-- |
| `$0` | 整条记录（当前行原始内容） | 通用 |
| `$1` … `$n` | 第 n 个字段 | 通用 |
| `$NF` | 最后一个字段 | 通用 |
| `$(NF-1)` | 倒数第二个字段 | 通用 |
| `$x` | 变量 `x` 作为字段序号，**动态取字段** | 通用，但要用括号写成 `$(x)` 更安全 |
| 给 `$2` 赋值 | 修改字段后 `$0` 会自动重算（会用 `OFS` 重新拼接） | 通用 |

```bash
$ printf 'alice 30 beijing\nbob 25 shanghai\n' | awk '{ print $1, "住在", $3, "年龄", $2 }'
alice 住在 beijing 年龄 30
bob 住在 shanghai 年龄 25

# 动态取字段：$ 后面可以是表达式
$ echo 'a b c d' | awk -v n=3 '{ print $n, $(n+1) }'
c d
```

**分隔符**由 `FS`（输入）和 `OFS`（输出）控制，有两种设置时机，效果不同：

```bash
# 方式一：命令行 -F（推荐，能正确处理单字符分隔符）
awk -F: '{ print $1 }' /etc/passwd

# 方式二：在 BEGIN 里给 FS 赋值
awk 'BEGIN{ FS="," } { print $2 }' data.csv

# 分隔符可以是正则（POSIX 也支持，但多字符时行为因实现而异）
awk -F'[,;|]' '{ print NF }' data.txt
echo 'a::b::::c' | awk -F':+' '{ print NF }'      # 连续分隔符算一个：3
```

> [!caution]
> **`-F` 与 `BEGIN{FS=...}` 的经典陷阱**
> 对于**多字符**分隔符，`-F` 在 gawk/mawk 中按**正则**处理，而某些老实现按字面处理。想确保一致，用单字符分隔符，或在 `BEGIN` 中显式写 `FS`。另外注意 `-F' '`（单个空格）是特殊值：表示"按任意空白切分并丢弃首尾空白"，这是 **awk 的默认行为**。

**默认切分规则**：不指定 `FS` 时，按"连续空格/Tab 的任意组合"切分，且**自动忽略行首行尾空白**。这就是它比 `cut -d' '` 好用的原因：

```bash
$ echo '   a    b  c  ' | awk '{ print NF, $1, $3 }'
3 a c
```

**改变记录分隔符**用 `RS`：

```bash
# 把空行当记录分隔，读"段落"而非"行"
awk 'BEGIN{ RS=""; FS="\n" } { print NR": "NF" 行" }' article.txt
awk 'BEGIN{ RS="" } END{ print NR }' article.txt      # 段落计数

# 按 NUL 读，处理含换行的文件名
find . -print0 | awk 'BEGIN{ RS="\0" } { print NR, $0 }'
```

---

## 三、内置变量速查

| 变量 | 含义 | 通用性 |
| :-- | :-- | :-- |
| `$0` | 当前整条记录 | 通用 |
| `$1`…`$n` | 第 n 个字段 | 通用 |
| `NF` | 当前记录的**字段数量** | 通用 |
| `NR` | 已读入的**记录总数**（跨文件累计） | 通用 |
| `FNR` | 当前**文件内**的记录号（换文件归零） | 通用 |
| `FS` | 输入字段分隔符，默认 `" "` | 通用 |
| `OFS` | 输出字段分隔符，默认 `" "` | 通用 |
| `ORS` | 输出记录分隔符，默认 `"\n"` | 通用 |
| `RS` | 输入记录分隔符，默认 `"\n"` | 通用 |
| `FILENAME` | 当前输入文件名 | 通用 |
| `SUBSEP` | 多维数组下标拼接符，默认 `"\034"` | 通用 |
| `ARGC` / `ARGV` | 命令行参数个数 / 参数数组 | 通用 |
| `ENVIRON` | 环境变量数组，`ENVIRON["HOME"]` | 通用 |
| `CONVFMT` | 数字转字符串格式，默认 `"%.6g"` | 通用 |
| `OFMT` | `print` 输出数字的格式，默认 `"%.6g"` | 通用 |
| `RSTART` / `RLENGTH` | `match()` 的结果：匹配起点与长度（失败为 0 / -1） | 通用 |
| `IGNORECASE` | 置 1 后正则**忽略大小写** | **gawk 扩展**；mawk 1.3.4+ 也支持，busybox 不一定 |
| `FIELDWIDTHS` | 按**固定列宽**切分而非分隔符 | **gawk 扩展** |
| `FPAT` | 用正则描述"字段长什么样"（比 FS 更适合 CSV） | **gawk 扩展** |
| `PROCINFO` | 进程信息数组（`PROCINFO["version"]` 等） | **gawk 扩展** |
| `RT` | 实际匹配到的记录分隔符文本 | **gawk 扩展** |
| `ARGIND` | 当前文件在 `ARGV` 中的下标 | **gawk 扩展** |
| `ERRNO` | 出错描述（配合 `getline` 读失败） | **gawk 扩展** |
| `TEXTDOMAIN` | 消息翻译域 | **gawk 扩展** |

几条最常用的实战组合：

```bash
# NF 判断空行（空行 NF 为 0）—— 删除空行
awk 'NF' file.txt

# NR 带行号
awk '{ print NR": "$0 }' file.txt

# FNR 用来识别"每个文件的第一行"（NR 做不到）
awk 'FNR==1 { print "=== " FILENAME } { print }' a.txt b.txt

# 多文件处理时，必须用 FNR 而非 NR
awk 'FNR==NR { first[$1]=1; next } $1 in first' list.txt data.txt   # 求交集
```

> [!note]
> **`NR==NR` 是 awk 的惯用技巧**
> 处理多个文件时，第一个文件里 `NR` 与 `FNR` 相等，进入第二个文件后 `NR` 继续累加而 `FNR` 归零。于是 `FNR==NR` 天然表示"正在读第一个文件"。上例即"用 list.txt 的第一列，过滤 data.txt"。

---

## 四、内置函数速查

### 1. 字符串函数

| 函数 | 作用 | 通用性 |
| :-- | :-- | :-- |
| `length(s)` | 字符串长度；省略参数为 `$0` | 通用 |
| `substr(s, m[, n])` | 从第 m 个字符（1 起）取 n 个字符 | 通用 |
| `index(s, t)` | `t` 在 `s` 中首次出现的下标，无则 0 | 通用 |
| `split(s, arr[, fs])` | 按 `fs` 分割到数组，返回元素个数 | 通用 |
| `sub(re, repl[, s])` | **替换第一处**，返回替换次数 | 通用 |
| `gsub(re, repl[, s])` | **替换全部**，返回替换次数 | 通用 |
| `match(s, re)` | 匹配正则，设置 `RSTART`/`RLENGTH`，返回起点 | 通用 |
| `sprintf(fmt, ...)` | 按格式生成字符串（不输出） | 通用 |
| `tolower(s)` / `toupper(s)` | 大小写转换 | 通用 |
| `gensub(re, repl, how[, s])` | 强大替换，支持 `\1` 反向引用与"第 n 处" | **gawk 扩展** |
| `strtonum(s)` | 字符串转数字（识别 `0x`/`0` 前缀） | **gawk 扩展** |
| `asort(arr[, dest])` | 按值排序数组 | **gawk 扩展** |
| `asorti(arr[, dest])` | 按下标排序数组 | **gawk 扩展** |
| `patsplit` / `typeof` / `isarray` | 模式切分 / 类型判断 | **gawk 扩展**（`typeof`、`isarray` 需 gawk 4.2 以上） |

```bash
# length / substr：第一个字符到第 3 个
$ echo "abcdef" | awk '{ print length($0), substr($0,1,3), substr($0,3) }'
6 abc cdef

# index + substr：取两个分隔符之间的内容
$ echo "user=<alice>;" | awk '{ i=index($0,"<"); j=index($0,">"); print substr($0, i+1, j-i-1) }'
alice

# split：把一行拆成数组再按序遍历（split 返回的是元素个数，务必用它，别用 length(arr)）
$ echo "a:b:c" | awk '{ n=split($0, arr, ":"); for (i=1; i<=n; i++) print i, arr[i] }'
1 a
2 b
3 c

# sub / gsub：注意默认作用于 $0，且会改动字段
$ echo "hello world" | awk '{ gsub(/o/, "0"); print }'
hell0 w0rld

# 只替换某一列，再打印整行（经典去回车/去引号）
awk -F, 'BEGIN{OFS=","} { gsub(/\r/, "", $NF); print }' data.csv

# sprintf：拼格式串
$ echo "3 7" | awk '{ printf "%s\n", sprintf("%03d-%05.2f", $1, $2) }'
003-07.00
```

> [!tip]
> **`gsub` 的反斜杠是新手第一坑**
> `repl` 里的反斜杠有两层转义：shell 一层、awk 一层。想插入一个字面反斜杠，得写 `gsub(/x/, "\\\\")`。另有约定：`&` 在 `repl` 中代表**整个匹配文本**，要输出字面 `&` 需写成 `\&`。
>
> ```bash
> $ echo 'a-b' | awk '{ gsub(/-/, "[&]"); print }'   # & = 匹配到的 "-"
> a[-]b
> ```

### 2. 数学函数

| 函数 | 说明 | 通用性 |
| :-- | :-- | :-- |
| `int(x)` | 截断取整（朝零方向） | 通用 |
| `sqrt(x)` `exp(x)` `log(x)` | 平方根 / e 的幂 / 自然对数 | 通用 |
| `sin(x)` `cos(x)` `atan2(y, x)` | 三角函数（弧度） | 通用 |
| `rand()` | 返回 `[0,1)` 随机数 | 通用 |
| `srand([seed])` | 设置随机种子，返回旧种子 | 通用 |
| `log` 的双参形式 | gawk 可计算任意底数 | **gawk 扩展** |
| `and/or/xor/compl/lshift/rshift` | 位运算 | **gawk 扩展**（mawk 也有部分实现） |

```bash
# 保留两位小数：printf 比 int 更可靠
awk '{ printf "%.2f\n", $1/3 }' nums.txt

# 四舍五入到整数（int 是截断，要自己加 0.5）
awk '{ print int($1 + 0.5) }' nums.txt

# 可复现的随机抽样：固定种子，只对第一行之外的记录判断
awk 'BEGIN{ srand(42) } rand() < 0.1' big.txt
```

### 3. 输入输出与系统函数

| 函数 / 写法 | 作用 | 通用性 |
| :-- | :-- | :-- |
| `print` | 按 `OFS` 拼接参数，末尾加 `ORS` | 通用 |
| `printf fmt, args` | 格式化输出，**不会自动换行** | 通用 |
| `getline` | 读下一条记录（多种形式，见下） | 通用 |
| `getline var` | 读入到变量，**不更新** `NF`/`NR`（无重定向时更新 NR） | 通用 |
| `close(name)` | 关闭文件/管道，让缓冲区落盘 | 通用 |
| `system(cmd)` | 执行 shell 命令，返回退出码 | 通用 |
| `print \| "cmd"` | 输出到管道；`while ((cmd \| getline) > 0)` 读取命令输出 | 通用 |
| `nextfile` | 跳到下一个输入文件 | **gawk 扩展**（mawk 1.3.4 起支持） |
| `fflush([file])` | 强制刷新缓冲 | **gawk 扩展** |

```bash
# printf 构造对齐报表
$ seq 3 | awk '{ printf "%-6s|%6.2f\n", "行"NR, $1*1.5 }'
行1   |  1.50
行2   |  3.00
行3   |  4.50

# 从外部命令读入：统计当前目录文件数
awk 'BEGIN{ while (("ls -1" | getline f) > 0) n++; print n }'

# 写多个输出文件：按第一个字段分文件
awk '{ print > ($1 ".log") } END{ close("x.log") }' app.log
```

> [!warning]
> **`>` 在 awk 里不是"覆盖"语义的普通重定向**
> awk 的 `print > "file"` 只在**首次**打开时截断文件，之后都是追加位置——同一个文件被多次 `print >` 不会反复清空。这通常是你要的，但若想每次重跑都干净，得先删文件或用不同的文件名策略。另外别忘了 `close()`：不关闭的话文件句柄会一直累积，文件过多可能触发"打开文件数超限"。

### 4. 数组特性（关联数组）

awk 的数组是**哈希表**，下标可以是字符串，不需要声明长度。

| 写法 | 说明 |
| :-- | :-- |
| `a["k"] = 1` | 直接赋值即创建 |
| `for (k in a)` | 遍历，**顺序不确定** |
| `delete a[k]` | 删除单个元素 |
| `delete a` | 清空整个数组（POSIX 也支持，但老实现可能只支持 gawk 形式） |
| `if ("k" in a)` | 判断键是否存在，**比读值判断更准确** |
| `a[i, j]` | 多维下标，实际是 `i SUBSEP j` 拼成的字符串 |
| `length(a)` | 元素个数——**gawk 扩展**，POSIX 不支持 |

```bash
# 词频统计（最经典的 awk 一行）
$ printf 'a b a c b a\n' | awk '{ for (i=1; i<=NF; i++) c[$i]++ } END{ for (k in c) print k, c[k] }'
a 3
b 2
c 1

# 保序去重：利用数组 + 副作用（!seen[$0]++ 为真只在该键首次出现时）
$ printf 'x\ny\nx\nz\n' | awk '!seen[$0]++'
x
y
z

# 分组求和
$ awk '{ sum[$1] += $2 } END{ for (k in sum) printf "%-10s %8.2f\n", k, sum[k] }' sales.txt

# 二维统计（SUBSEP 自动生效）
awk '{ m[$1, $2]++ } END{ for (k in m) print k, m[k] }' data.txt
```

`!seen[$0]++` 值得单独解释：`seen[$0]++` 返回**自增前的旧值**。键首次出现时旧值为 0（假），取反后为真，于是执行默认动作 `print $0`；再次出现时旧值非 0（真），取反为假，整条规则跳过。这是 awk 里"条件与计数合体"的经典写法。

---

## 五、运算符与特殊符号

| 符号 | 含义 | 备注 |
| :-: | :-- | :-- |
| `$` | 取字段 | `$0` 整行，`$(expr)` 动态 |
| `~` / `!~` | 正则匹配 / 不匹配 | 右侧可以是变量：`$1 ~ re` |
| `!` | 逻辑非 | `!seen[$0]++` |
| `&&` `\|\|` | 逻辑与 / 或（短路求值） | |
| `==` `!=` `<` `<=` `>` `>=` | 比较 | 注意与 `>` 重定向歧义 |
| `+ - * / %` | 算术 | `/` 是浮点除法 |
| `^` 或 `**` | 幂 | POSIX 两者都支持 |
| `++` `--` | 自增自减，**前后缀返回值不同** | 见下 |
| `=` `+=` `-=` `*=` `/=` `%=` `^=` | 赋值与复合赋值 | |
| `? :` | 三元运算符 | |
| `in` | 数组成员判断 | `if (k in a)` |
| `( )` | 分组 / 数组下标 / 多行续写 | |
| `;` | 语句分隔 | |
| `,` | `print` 参数分隔、数组多维下标 | |
| `\|` | 管道输出到命令或 `getline <` 的来源 | |
| `#` | 注释到行尾 | |
| `\` 行尾 | 续行 | `&&` `\|\|` `,` 后的换行可省略 `\` |
| `\|\|` 前的换行、`BEGIN{...}` 后 | 语句块可换行 | |

**前缀与后缀的区别**最容易出错，务必分清：

```awk
awk '{ print i++, i }' <<<""      # 输出 "0 1"：先取值再加
awk '{ print ++i, i }'  <<<""     # 输出 "1 1"：先加再取值
awk '{ a[$1]++ } END{...}'         # 计数惯用法：先读旧值，再自增
```

**比较是"数字优先"的**：如果一个字段看起来像数字，比较按数值进行，否则按字符串。这既是便利也是陷阱：

```bash
$ printf '10\n9\n' | awk '$1 > 9'
10                      # 按数值比较，正确

$ printf '010\n9\n' | awk '$1 > 9'    # 仍按数值比较（前导零不破坏数字判断）
010

# 想强制按字符串比较：用 "" 拼接把字段变成字符串，再和字符串常量比
$ printf '10\n9\n' | awk '{ print $1, ($1 "" < "9") }'
10 1                      # "10" 在字典序上小于 "9"
9 0
```

> [!tip]
> **`+0` 是强制转数值的常用手法**
> `df -h` 输出的 `80%` 带百分号，直接比较会退化成字符串比较。加上 `+0` 让它变数字：`awk '$5+0 > 80'`。反过来，`$1 ""` 可以强制转成字符串。

---

## 六、模式（Pattern）的几种形态

| 形态 | 示例 | 说明 |
| :-- | :-- | :-- |
| 无条件 | `{ print }` | 每条记录都执行 |
| 值模式 | `$3 > 100` | 表达式为真则执行 |
| 正则模式 | `/error/` | 匹配 `$0` 则执行 |
| 表达式正则 | `$2 ~ /^a/` | 对指定字段匹配 |
| 范围模式 | `/start/, /end/` | 从匹配 start 到匹配 end（含两端） |
| 特殊模式 | `BEGIN` / `END` | 输入前 / 后各执行一次 |

```bash
# 范围模式：截取两个标记之间的内容
awk '/^BEGIN$/, /^END$/' file.txt

# 组合条件：多个模式用逗号以外的方式组合要用 &&
awk '$1 == "ERROR" && $NF > 500 { print FILENAME": "$0 }' *.log

# 只用 BEGIN：awk 可以当计算器
awk 'BEGIN{ printf "%.4f\n", 3.14159 * 2 * 2 }'

# 只用 END 做汇总
awk '{ n++ } END{ print "总行数:", n+0 }' file.txt
```

**默认动作**：模式后面不写 `{ }` 时，默认动作是 `print $0`。`awk '/x/'` 等价于 `awk '/x/ { print }'`。

**BEGIN 与 END 的边界**：`BEGIN` 在**任何输入被读取之前**执行，此时 `$0`、`NF`、`NR` 都是空/0；`END` 在**所有输入读完之后**执行，但字段和 `NR` 保留最后一条记录的值，所以 `END{ print NR }` 能拿到总行数。

---

## 七、控制结构

```awk
# if / else if / else
awk '{ if ($3 > 90) g="A"; else if ($3 > 80) g="B"; else g="C"; print $1, g }' scores.txt

# while 与 do-while
awk 'BEGIN{ i=0; while (i<3) { print i; i++ } }'
awk 'BEGIN{ i=0; do { print i; i++ } while (i<3) }'

# for 三段式
awk '{ for (i=1; i<=NF; i++) if ($i ~ /x/) print NR, i }' file.txt

# for-in 遍历数组（顺序不保证）
awk '{ c[$1]++ } END{ for (k in c) print k, c[k] }'

# break / continue / next / exit
awk '{ if ($1 == "skip") next; print }' file.txt      # next：跳过本行后续规则
awk 'NR==5 { exit } { print }' file.txt               # exit：立即结束（END 仍会执行）
awk '{ for (i=1; i<=NF; i++) { if ($i == "0") continue; print $i } }' file.txt
```

> [!note]
> **`next` 与 `exit` 的差别**
> - `next` 停止处理**当前行**，跳到下一条记录（即回到第一条规则）；
> - `nextfile` 停止处理**当前文件**，跳到下一个输入文件（gawk 扩展）；
> - `exit` 直接结束程序，但 **`END` 块依然会执行**。若在 `END` 里再 `exit`，才真正立即退出。
>
> 另外 `exit <code>` 可以指定退出码：`awk 'END{ exit (count > 0) ? 0 : 1 }'`，非常适合放在 shell 的 `if` 里做校验。

---

## 八、命令行选项

| 选项 | 作用 | 通用性 |
| :-- | :-- | :-- |
| `-F fs` | 指定输入字段分隔符 | 通用 |
| `-v var=value` | **在读取输入前**定义变量 | 通用 |
| `-f file` | 从文件读取程序，可多次叠加 | 通用 |
| `--` | 选项结束，之后都当文件名 | 通用 |
| `-W ...` | 实现相关选项入口 | mawk/busybox 用得多 |
| `--posix` | 禁用所有 gawk 扩展 | gawk |
| `--csv` | 直接按 RFC 4180 解析 CSV（含引号、内嵌逗号换行） | **gawk 5.3+**，需较新的发行版才有 |
| `--json` | 按 JSON 解析输入 / 输出 | **gawk 5.2+** |
| `-i includefile` | 加载 awk 库文件 | gawk |
| `-l lib` | 加载共享库（`-l time` 等） | gawk |
| `-M` / `-b` | 任意精度 / 单字节字符 | gawk |

```bash
# -v 把 shell 变量传进去（推荐，作用时机最早）
threshold=100
awk -v t="$threshold" '$3 > t' data.txt

# 注意：-v 的值会被 awk 做转义处理，反斜杠需加倍
awk -v s='a\\b' 'BEGIN{ print s }'      # 输出 a\b

# -v 与命令行赋值的区别：命令行 var=value 出现在文件参数之间
awk '{ print FILENAME, x }' x=1 a.txt    # x=1 在 BEGIN 时还不可见
```

> [!caution]
> **三种"传变量"的方式不要混**
> - `-v x=1`：**BEGIN 里就能用**，最稳妥；
> - `x=1 file`（放在文件参数位置）：在读**第一个文件之前**生效，`BEGIN` 中看不到；
> - 环境变量 + `ENVIRON["X"]`：跨进程传递时用，注意它永远是字符串。

---

## 九、常用套路（可以直接抄）

### 1. 日志/文本处理

```bash
# 按状态码统计访问量
awk '{ c[$9]++ } END{ for (k in c) print k, c[k] }' access.log | sort -k2 -nr

# 找出响应最大的前 5 个 URL
awk '{ print $7, $10 }' access.log | sort -k2 -nr | head -5

# 统计每个 IP 的请求数，并过滤阈值
awk '{ c[$1]++ } END{ for (k in c) if (c[k] > 1000) print c[k], k }' access.log

# 各列求和与平均
awk '{ for (i=1; i<=NF; i++) s[i]+=$i } END{ for (i=1; i<=NF; i++) printf "列%d 和=%g 均=%.2f\n", i, s[i], s[i]/NR }' nums.txt

# 求最大最小值（用 -inf 作为哨兵）
awk 'NR==1 { max=min=$1 } { if ($1>max) max=$1; if ($1<min) min=$1 } END{ print min, max }' nums.txt

# 两文件求交集 / 差集 / 并集
awk 'FNR==NR { a[$1]=1; next } $1 in a'  list.txt data.txt    # 交集
awk 'FNR==NR { a[$1]=1; next } !($1 in a)' list.txt data.txt  # 差集（在 data 不在 list）

# 合并两文件（用第一列做 key 拼接）
awk 'FNR==NR { a[$1]=$2; next } { print $0, a[$1] }' map.txt main.txt
```

### 2. 数据整形与转换

```bash
# 转 CSV（指定输入输出分隔符）
awk 'BEGIN{ FS="\t"; OFS="," } { $1=$1; print }' data.tsv

# 注意 $1=$1 的作用：它强制 awk 用 OFS 重新拼接 $0
$ printf 'a\tb\tc\n' | awk 'BEGIN{FS="\t"; OFS=","} { print }'
a	b	c                     # 没有重建，还是制表符
$ printf 'a\tb\tc\n' | awk 'BEGIN{FS="\t"; OFS=","} { $1=$1; print }'
a,b,c

# 生成 SQL insert 语句
awk -F, 'NR>1 { gsub(/"/, "\"\"", $2); printf "INSERT INTO t VALUES (%s, \"%s\");\n", $1, $2 }' rows.csv

# 行列转置
awk '{ for (i=1; i<=NF; i++) a[i, NR]=$i; if (NF>mx) mx=NF } END{ for (i=1; i<=mx; i++) { for (j=1; j<=NR; j++) printf "%s%s", a[i,j], (j<NR?OFS:ORS) } }' matrix.txt

# 按某列去重（保留首次出现）
awk '!seen[$2]++' data.txt

# 补齐/截断字段到固定宽度
awk -F, '{ printf "%-20.20s|%8s\n", $1, $2 }' data.csv
```

### 3. 与 shell 协作

```bash
# 在 shell 里用 awk 的退出码做判断
if awk 'END{ exit (NR > 0) ? 0 : 1 }' file.txt; then
  echo "文件非空"
fi

# 用 awk 生成数据流喂给 while（注意别让 read 抢走 awk 的标准输入）
while read -r line; do
  echo "处理: $line"
done < <(awk '{ print toupper($1) }' file.txt)

# 用 system() 做副作用，但要注意缓冲区顺序
awk '{ cmd="gzip -c > " $1 ".gz"; print $2 | cmd; close(cmd) }' list.txt
```

> [!warning]
> **`system()` 的输出顺序会乱**
> awk 有自己的输出缓冲区，`system()` 调用的子进程直接写同一个 stdout，两者不同步。要保证顺序，在 `system()` 前先 `fflush()`（gawk 扩展），或者干脆让 awk 只打印、由 shell 循环执行命令。

---

## 十、实现差异与兼容性

| 实现 | 常见于 | 特点 |
| :-- | :-- | :-- |
| **gawk** | RHEL / CentOS / Fedora / Arch、多数源码编译 | 功能最全：`gensub`、`asort`、`FPAT`、`--csv`、`--json`、位运算、`-l` 库 |
| **mawk** | **Debian / Ubuntu 默认** | 速度最快，功能少；无 `gensub`/`asort`/`strtonum`，无 `--csv` |
| **busybox awk** | Alpine、OpenWrt、嵌入式 | 极简，正则和数组细节有差异，扩展几乎没有 |
| **BWK awk / nawk** | macOS、部分 BSD | 最贴近原始 POSIX，功能最少 |

### 判断当前用的是哪个

```bash
awk --version          # gawk → "GNU Awk 5.x"；macOS BWK → "awk version 20200816"；mawk 会报未知选项
awk -W version         # mawk → "mawk 1.3.4"；macOS BWK → "awk version 20200816"
ls -l "$(command -v awk)"    # 看是否软链到 mawk / busybox
busybox 2>/dev/null | head -1   # 确认系统里是否有 busybox awk

# 最可靠的一条：用 awk 自己报告
awk 'BEGIN{ printf "%s\n", ("version" in PROCINFO) ? "gawk " PROCINFO["version"] : "非 gawk" }'
```

> [!warning]
> **`awk --version` 的返回值不能当判据**
> macOS 的老版 BWK awk 也能接受 `--version`（输出 `awk version 20200816`），而 mawk 对 `--version` 报错但支持 `-W version`。所以别用"命令成功与否"判断是不是 gawk，用上面那条 `PROCINFO` 探测最稳。

### 写"到处都能跑"的脚本

遵循这几条就能覆盖 gawk / mawk / busybox：

1. **只用 POSIX 函数**：避开 `gensub`、`asort`、`strtonum`、`patsplit`、`typeof`、`isarray`、`length(arr)`。
2. **正则只用 POSIX 字符类**：`[[:space:]]` `[[:digit:]]` `[[:alpha:]]`，不要用 `\s` `\w` `\d` `\y`（后者是 gawk 专有的词边界）。
3. **多字符 `FS` 别依赖**：需要时在 `BEGIN` 里显式写，或用单字符 + `split()`。
4. **不要依赖 `for (k in a)` 的顺序**：要排序就自己生成数组后用 `sort` 管道，或改用 `PROCINFO["sorted_in"]`（仅 gawk）。
5. **给 gawk 专有写法加上守卫**：如果脚本可以选择性用扩展，先探测再决定路径。

```awk
#!/usr/bin/awk -f
# 探测实现：gawk 的 PROCINFO 存在，mawk/busybox 没有
BEGIN { GNU_AWK = ("version" in PROCINFO) }

# 需要"只替换第 2 处"这类 gawk 专有能力时，先判断再走分支
{ if (GNU_AWK) print gensub(/o/, "0", 2, $0)   # gawk 支持按序号替换
  else print "此功能需要 gawk" }
```

> [!caution]
> **不要用"循环 sub 模拟 gsub 的扩展行为"**
> 常见写法 `while (sub(re, repl, s))` 有两个问题：一是**替换结果若仍匹配 `re` 就死循环**，二是它改变的是副本而非原串语义时会悄悄出错。需要 gawk 能力就直接要求 gawk，别硬凑。

> [!tip]
> **更稳的做法**
> 上面那个探测思路仅供参考，`while (sub(...))` 这类"手写循环替换"在替换结果还包含匹配模式时会**死循环**，生产脚本里更推荐直接要求安装 gawk：

```bash
# gawk 有 --version，mawk 是 -W version，busybox awk 两者都没有
if ! awk --version 2>/dev/null | grep -qi 'GNU Awk'; then
  echo "此脚本使用了 gawk 扩展，请先安装 gawk" >&2
  exit 1
fi
```

> [!note]
> **更简短的探测：用 awk 自己判断**
> gawk 定义了 `PROCINFO`，mawk/busybox 没有。所以一行就能区分：

```bash
awk 'BEGIN{ exit !("version" in PROCINFO) }' && echo "gawk" || echo "非 gawk"
```

```bash
# 或者按需要的能力逐个探测，比判断实现名更贴合实际
awk 'BEGIN{ exit !("sorted_in" in PROCINFO) }' && echo "支持排序数组"
```

---

## 十一、第三方实现与扩展

除了系统自带，还有几条升级路线。

### 1. gawk —— 直接安装即可，最省事

所有发行版都有包，装上就是最完整的功能集：

```bash
# Debian / Ubuntu：把默认 awk 切到 gawk（推荐做，行为更符合文档）
sudo apt update && sudo apt install -y gawk
sudo update-alternatives --set awk /usr/bin/gawk      # 或在 install 时会提示选择
update-alternatives --config awk                       # 交互式切换 mawk/gawk

# RHEL / Fedora
sudo dnf install -y gawk

# Alpine
apk add gawk

# macOS（系统自带的是老版 BWK awk）
brew install gawk
```

::: note 为什么建议在开发机上装 gawk
线上环境是 mawk，本地是 gawk，就会出现"本地跑通线上失败"。要么两边统一成 gawk，要么严格按 POSIX 子集写。**在 Debian/Ubuntu 上装 gawk 通常是性价比最高的选择**——功能和报错信息都友好得多，例如 `gawk` 会明确告诉你哪个函数不存在。
:::

### 2. gawk 的扩展机制

gawk 提供了两种把能力外挂出去的方式，这是它和其它实现的本质区别。

**（一）`-l` 加载共享库，提供自定义"内置"函数**

自带的几个见下表，用法是 `gawk -l <库名>`，然后在程序里直接调用：

| 库 | 提供的函数 | 用途 |
| :-- | :-- | :-- |
| `time` | `strftime` 的强化版、`mktime`、`gettimeofday`、`systime` 等 | 时间运算，比内置的 `mktime` 细致 |
| `filefuncs` | `stat`、`chdir`、`fts` | 文件系统遍历、取元数据 |
| `fnmatch` | `fnmatch` | shell 通配符匹配 |
| `fork` | `fork`、`wait`、`popen` | 真进程控制 |
| `readdir` | `readdir`、`readfile` | 目录读取 |
| `rwarray` | `reada`、`writea` | 数组序列化到文件 |
| `intdiv` | `intdiv` | 整数除法与取余（含负数语义） |
| `inplace` | 配合 `-i inplace` 使用 | **gawk 5.2+**，原地改写文件，类似 `sed -i` |

```bash
# 原地修改文件，不用临时文件（gawk 5.2+ 的 inplace 扩展）
gawk -i inplace '{ gsub(/foo/, "bar"); print }' file.txt

# 用 time 库格式化时间戳
gawk -l time '{ print strftime("%F %T", $1) }' timestamps.txt

# 用 filefuncs 取文件大小（stat 的第二个参数是"返回值数组"）
gawk -l filefuncs '{ stat($1, sb); printf "%8s  %s\n", sb["size"], $1 }' filelist.txt
```

**（二）`@load` / `-l` 加载自定义 C 扩展**

你也可以用 C 写自己的扩展函数，编译成 `.so` 后 `@load "myext"` 引入。接口在 gawk 源码的 `extension/` 目录里有示例，需要 `gawkapi.h`。适合把性能敏感的解析逻辑（比如真正的 CSV/JSON 解析）下沉到 C。

**（三）awk 库文件与 `-i`**

`-i lib` 相当于在程序开头插入一个 awk 源码文件，用来放公共函数：

```bash
# common.awk 里定义 trim() 等，然后复用
gawk -i common.awk -f script.awk data.txt
```

### 3. 更多可选的 awk 实现

| 名称 | 说明 | 何时考虑 |
| :-- | :-- | :-- |
| **goawk** | Go 写的 POSIX awk，跨平台单文件二进制，同时支持部分 gawk 扩展和 `-i csv`（**能正确解析 CSV**） | 需要处理真正的 CSV、想装单一二进制、或要嵌进 Go 程序 |
| **busybox awk** | 不是独立项目，但可通过 `busybox awk` 显式调用 | 容器里只有 busybox 时保证使用它 |
| **one-true-awk (BWK awk)** | 原始版本，Docker 时代被各大发行版重新打包 | 追求极致可移植/最贴近标准 |
| **mawk** | 速度优先的实现 | 大规模文本处理，且用不到扩展 |
| **frawk / awk-rs** | Rust 实现，多核并行、性能导向 | 数据量大到单线程 awk 扛不住时（注意语法子集） |

```bash
# goawk：单文件二进制，能直接吃 CSV（版本号请到 releases 页取最新的）
curl -LO https://github.com/benhoyt/goawk/releases/latest/download/goawk_v1.29.1_linux_amd64.tar.gz
tar xzf goawk_v1.29.1_linux_amd64.tar.gz && sudo mv goawk /usr/local/bin/
goawk -i csv -f prog.awk data.csv

# 也支持作为 Go 库引入，或用作 POSIX awk 的替代直接跑既有脚本
goawk '{ c[$1]++ } END{ for (k in c) print k, c[k] }' huge.txt

# frawk：Rust 写的并行实现，适合大文件（语法是 POSIX 子集，先小样本验证）
cargo install frawk
frawk '{ c[$1]++ } END{ for (k in c) print k, c[k] }' huge.txt
```

> [!note]
> **什么时候该"离开 awk"**
> awk 没有真正的 CSV 解析（引号内逗号、内嵌换行会错），没有浮点以外的复杂数值类型，也没有模块系统。一旦遇到这些，优先考虑：
>
> - **CSV/TSV 整形** → `csvkit`、`xsv`/`qsv`，或 goawk 的 csv 模式；
> - **JSON** → `jq`（gawk 5.2+ 的 `--json` 也能应付简单场景）；
> - **逻辑超过二三十行、需要测试** → 直接上 Python，可读性和可维护性会好得多；
> - **结构化数据查询** → `sqlite3` 或 `duckdb`，SQL 表达聚合比分组的 awk 循环清晰。

---

## 十二、常见陷阱清单

| 陷阱 | 说明与对策 |
| :-- | :-- |
| 单引号冲突 | 程序整体用单引号包裹，内部想用单引号要走 `'"'"'` 或改用 `"\47"` |
| `$` 被 shell 吃掉 | 在双引号里时必须写 `\$1`；永远优先用单引号 |
| `>` 与比较混淆 | 判断用 `$1 > 10`，重定向用 `print > "f"`，shell 侧不受影响 |
| `NR` vs `FNR` | 多文件时用 `FNR` 判断"每个文件的第一行" |
| 空文件时 `NR` 为 0 | 做除法前判 `NR>0`，否则 awk 直接报 `division by zero` 并退出（gawk/mawk 是致命错误，不是给你 NaN） |
| 数字/字符串比较歧义 | 强制转换：数值用 `$x+0`，字符串用 `$x ""` |
| `getline` 的坑 | 无重定向的 `getline` 会更新 `NR`，有重定向的**不会**；作为表达式时要加括号判断返回值 |
| 数组遍历顺序随机 | 需有序就用 `sort` 管道或 gawk 的 `PROCINFO["sorted_in"]` |
| 文件句柄泄漏 | 频繁 `print > file` 后记得 `close(file)` |
| 打印数字丢精度 | `print` 走 `OFMT`（默认 `%.6g`），小数会被截成 6 位有效数字甚至变科学计数法；要完整输出用 `printf` 显式指定格式 |
| `substr` 下标从 1 开始 | 与 C、Python 习惯不同 |
| 正则特殊字符 | `.` `*` `[` 等要转义；字面点要写 `\.` |
| 在 Alpine 上失效 | busybox awk 缺很多扩展，用 `apk add gawk` 解决 |
| `printf` 不自动换行 | 忘了 `\n` 就会全部粘成一行 |

```bash
# OFMT 只作用于"非整数值"，所以整数运算看起来没问题
$ printf '1000000\n' | awk '{ print $1 + 1 }'
1000001

# 一旦结果带小数，print 就会按 %.6g 截断，甚至跳到科学计数法
$ awk 'BEGIN{ x = 1000000 * 1.0000001; print x, x + 0.5 }'
1e+06 1e+06

# 用 printf 显式指定格式才可靠
$ awk 'BEGIN{ x = 1000000 * 1.0000001; printf "%.6f | %.0f\n", x, x + 0.5 }'
1000000.100000 | 1000001

# 顺带记一下：awk 的数字是双精度浮点，整数精度上限是 2^53
$ awk 'BEGIN{ print 2^53, 2^53 + 1 }'
9007199254740992 9007199254740992
```

---

::: tip 学习路径建议
先记住四件事：**`$n` 取列、`NR/NF` 定位、`-F` 定分隔符、`END` 里做汇总**。这四条能覆盖日常八成需求。之后再补上关联数组（能写词频统计就算入门了）、`sub`/`gsub`/`match` 这几个字符串函数、以及 `-v` 传参。剩下的都是查阅手册的事——`man awk` 和 gawk 的官方手册（`info gawk`，或在线版 GNU Awk User's Guide）是最可靠的来源，比二手教程准。
:::
