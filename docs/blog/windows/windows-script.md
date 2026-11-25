---
title: Windows 脚本编写指南：PowerShell 与 bat 写法对照与命令速查
createTime: 2026/11/25 10:53:35
tags: [windows, powershell, bat, 脚本]
permalink: /blog/qyt6wro9/
---

## 一、先分清 PowerShell 与 bat {#ps-vs-bat}

Windows 上有两套常用的脚本方式：PowerShell（`.ps1`）和 cmd 批处理（`.bat` / `.cmd`）。PowerShell 又有两个互不相同的运行时：系统自带的 **Windows PowerShell 5.1** 和需要单独安装的 **PowerShell 7+**。本文以 5.1 为兼容基线，PS 7 独有写法会单独标注。

### Windows PowerShell 5.1 与 PowerShell 7

| 维度 | Windows PowerShell 5.1 | PowerShell 7+ |
| :-- | :-- | :-- |
| 可执行文件 | `powershell.exe` | `pwsh.exe` |
| 运行时 | .NET Framework | .NET |
| 系统自带 | Windows 10/11 自带 | 需要安装 |
| `$PSVersionTable.PSEdition` | `Desktop` | `Core` |
| 默认脚本编码 | 5.1 读无 BOM UTF-8 时按 ANSI 处理 | 默认 UTF-8 |
| 管道链 `&&` / `\|\|` | 不支持 | 支持 <Badge type="tip" text="PS 7+" /> |
| 三元 `? :` | 不支持 | 支持 <Badge type="tip" text="PS 7+" /> |
| `??` / `??=` | 不支持 | 支持 <Badge type="tip" text="PS 7+" /> |
| `ForEach-Object -Parallel` | 不支持 | 支持 <Badge type="tip" text="PS 7+" /> |
| `$IsWindows` / `$IsLinux` / `$IsMacOS` | 未定义 | 支持 <Badge type="tip" text="PS 7+" /> |
| `clean` 块 | 不支持 | 7.3+ <Badge type="tip" text="PS 7.3+" /> |
| 跨平台 | 仅 Windows | Windows / Linux / macOS |

::: warning 不要把 pwsh 的语法写进 5.1 脚本

`pwsh` 能跑的脚本不一定能在 `powershell.exe` 上跑。CI、计划任务、用户机器上默认存在的是 5.1；只要脚本要被别人直接运行，就按 5.1 写，或者显式用 `#Requires -Version 7.0` 拒绝低版本。

:::

### `.ps1` 与 `.bat` / `.cmd`

| 对比 | `.ps1` | `.bat` / `.cmd` |
| :-- | :-- | :-- |
| 解释器 | `powershell.exe` / `pwsh.exe` | `cmd.exe` |
| 执行策略 | 受 ExecutionPolicy 限制 | 不受 PowerShell 执行策略限制 |
| 双击 | 通常打开编辑器，或提示选择程序 | 直接运行 |
| 语法 | 对象、管道、Cmdlet | 字符串、命令、标签跳转 |
| 适合 | 结构化数据处理、系统管理 | 极简启动器、兼容老环境 |
| 编码 | 5.1 对 BOM 敏感 | 建议 ASCII，CRLF 换行 |

`.cmd` 与 `.bat` 由同一个 `cmd.exe` 解释，日常可以视为同一种格式；本文统一写 `.bat`。

### 执行策略与解除锁定

```powershell title="execution-policy.ps1"
Get-ExecutionPolicy -List
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
Get-ExecutionPolicy -Scope CurrentUser
```

- `RemoteSigned`：本地脚本可运行；从网络下载的脚本必须有可信签名，或先 `Unblock-File`。
- `-Scope CurrentUser` 只改当前用户，不需要管理员；组策略下发的 MachinePolicy 优先级更高，改不动时先看 `Get-ExecutionPolicy -List`。
- 一次性运行可以用进程级参数，不永久改配置：

```powershell title="run-once.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File .\script.ps1
```

- 从浏览器/邮件下载的 `.ps1` 带 Zone.Identifier，`Unblock-File` 只去掉“来自网络”的标记，不验证内容：

```powershell title="unblock.ps1"
Unblock-File -Path .\script.ps1
Get-Item .\script.ps1 -Stream Zone.Identifier -ErrorAction SilentlyContinue
```

::: warning 编码与换行是最常见的翻车点

**PowerShell 5.1** 读取没有 BOM 的 UTF-8 `.ps1` 时，会按系统 ANSI 代码页解释；脚本里有中文就可能乱码，甚至把字符串引号吃掉。给 5.1 的 `.ps1` 请保存为 **UTF-8 with BOM**（或 UTF-16 LE）。PowerShell 7 默认按 UTF-8 读取，无 BOM 也可以。

**bat** 必须是 **CRLF** 换行；LF 换行的 `.bat` 在 cmd 下会出现标签找不到、`goto` 跳错行等问题。批处理文件里有中文时，`chcp 65001` 只能改控制台代码页，不能保证 cmd 按 UTF-8 解析文件本身；最稳的是让 `.bat` 只包含 ASCII，中文输出交给 PowerShell 或外部程序。

:::

## 二、脚本骨架与执行 {#skeleton}

::: steps

1. **创建 PowerShell 脚本**

   ```powershell title="hello.ps1"
   param(
     [string]$Name = 'world'
   )

   Write-Output "hello, $Name"
   ```

2. **创建 bat 脚本**

   ```bat title="hello.bat"
   @echo off
   setlocal EnableExtensions
   set "NAME=%~1"
   if not defined NAME set "NAME=world"
   echo hello, %NAME%
   exit /b 0
   ```

3. **运行 PowerShell 脚本**

   ```powershell title="run-ps.ps1"
   powershell -NoProfile -ExecutionPolicy Bypass -File .\hello.ps1 Alice
   pwsh -NoProfile -File .\hello.ps1 Bob
   ```

   `powershell.exe` 是 5.1；`pwsh.exe` 是 PowerShell 7。`-NoProfile` 避免加载用户配置，`-File` 后面跟脚本路径和参数。

4. **运行 bat 脚本**

   ```bat title="run-bat.bat"
   cmd /c .\hello.bat Alice
   .\hello.bat Bob
   ```

   双击 `.bat` 等价于用 `cmd.exe /c` 运行；需要保留窗口看输出时，在脚本末尾加 `pause`，不要依赖双击后的默认行为。

5. **调试 PowerShell**

   ```powershell title="debug.ps1"
   Set-PSDebug -Trace 1
   .\hello.ps1 Alice
   Set-PSDebug -Trace 0

   Set-StrictMode -Version Latest
   ```

   `Set-PSDebug -Trace 1` 打印每一行；`Set-StrictMode -Version Latest` 把未定义变量、调用不存在属性等变成错误。调试 bat 用 `echo on`，或临时删掉 `@echo off`。

:::

PowerShell 的执行策略是“防止误运行”，不是安全边界；不要把它当成权限控制。bat 没有执行策略，任何能写文件的人都能改脚本，分发前要校验来源。

## 三、内置变量 {#variables}

### PowerShell 常用自动变量

| 变量 | 含义 | 5.1 | 7+ | 备注 |
| :-- | :-- | :-: | :-: | :-- |
| `$PSScriptRoot` | 当前脚本所在目录 | 是 | 是 | 被 dot-source 时仍是库文件目录 |
| `$PSCommandPath` | 当前脚本完整路径 | 是 | 是 | 交互式下为空 |
| `$MyInvocation` | 当前调用信息 | 是 | 是 | `.InvocationName` 可判断 dot-source |
| `$args` | 未绑定到 param 的参数 | 是 | 是 | 简单函数/脚本可用；高级函数中不可用，多余参数会报错 |
| `$PSBoundParameters` | 已绑定的命名参数 | 是 | 是 | `.ContainsKey('Name')` |
| `$LASTEXITCODE` | 最近一个原生程序的退出码 | 是 | 是 | 只对 `.exe` / `.com` 等有意义 |
| `$?` | 上一条命令是否成功 | 是 | 是 | 布尔值，不是退出码 |
| `$PID` | 当前 PowerShell 进程 PID | 是 | 是 | 与 `$LASTEXITCODE` 无关 |
| `$PSVersionTable` | 版本与平台信息 | 是 | 是 | `.PSVersion`、`.PSEdition` |
| `$IsWindows` | 是否 Windows | 否 | 是 | 5.1 用 `$env:OS -eq 'Windows_NT'` |
| `$env:NAME` | 环境变量 | 是 | 是 | 读写当前进程环境 |
| `$HOME` | 用户主目录 | 是 | 是 | 通常等于 `$env:USERPROFILE` |
| `$PWD` | 当前目录（PathInfo） | 是 | 是 | 字符串化后是路径 |
| `$null` | 空值 | 是 | 是 | 比较时写 `$null -eq $x` |
| `$_` / `$PSItem` | 管道当前对象 | 是 | 是 | 两者等价 |
| `$Error` | 错误记录数组 | 是 | 是 | `$Error[0]` 是最近错误 |
| `$Matches` | `-match` 的捕获结果 | 是 | 是 | `$Matches[1]` 起是分组 |

### bat 参数与常用变量

| 写法 | 含义 | 备注 |
| :-- | :-- | :-- |
| `%0` | 当前批处理文件名 | `call` 另一个 bat 后会变成被调用文件 |
| `%1` … `%9` | 第 1～9 个参数 | 超过 9 个用 `shift` 逐个取 |
| `%*` | 所有参数 | 原样保留（含引号），且不受 `shift` 影响；`shift` 后 `%*` 不变 |
| `%~dp0` | 当前脚本的盘符+路径 | **末尾带反斜杠** |
| `%~f0` | 当前脚本完整路径 | 含文件名 |
| `%~nx0` | 当前脚本文件名+扩展名 | `hello.bat` |
| `%~n0` | 当前脚本文件名 | `hello` |
| `%~x0` | 当前脚本扩展名 | `.bat` |
| `%ERRORLEVEL%` | 上一条命令退出码 | 在括号块里可能被提前展开 |
| `%CD%` | 当前目录 | 不含末尾反斜杠 |
| `%DATE%` / `%TIME%` | 系统日期/时间 | 格式受区域设置影响 |
| `%RANDOM%` | 0～32767 随机数 | 每次展开重新取值 |
| `%USERPROFILE%` | 用户主目录 | 常与 `%HOMEDRIVE%%HOMEPATH%` 等价 |
| `%APPDATA%` | 漫游 AppData | 用户级配置常用 |
| `%TEMP%` | 临时目录 | 与 `%TMP%` 通常相同 |

### 获取脚本所在目录

::: code-tabs

@tab:active PowerShell

```powershell title="script-dir.ps1"
# PS 3.0+ 的脚本中 $PSScriptRoot 总是可用。
$ScriptDir = $PSScriptRoot

if (-not $ScriptDir) {
  # 仅 PS 2.0 需要这段；5.1 / 7 在脚本里不会走到这里。
  $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $ScriptDir) {
  # 交互式直接粘贴代码：没有脚本路径，退回当前目录。
  $ScriptDir = (Get-Location).Path
}

Write-Output "script dir: $ScriptDir"
```

@tab bat

```bat title="script-dir.bat"
@echo off
set "SCRIPT_DIR=%~dp0"
echo script dir: %SCRIPT_DIR%
```

:::

`$PSScriptRoot` 在 PS 3.0+ 的脚本中总是可用；被 dot-source 时仍然指向**库文件自身目录**，这是它比 `$0` 可靠的地方。`$MyInvocation.MyCommand.Path` 兜底只针对 PS 2.0，交互式场景没有脚本路径，应该用 `(Get-Location).Path`。

bat 的 `%~dp0` 末尾带反斜杠，拼接时不要再补一个：

```bat title="script-path.bat"
@echo off
set "SCRIPT_DIR=%~dp0"
echo "%SCRIPT_DIR%config.ini"
echo "%SCRIPT_DIR%logs\app.log"
```

`call "%~dp0sub.bat"` 会进入子批处理上下文：子脚本里的 `%0` 变成 `sub.bat`，`%~dp0` 也变成子脚本目录；返回后主脚本的 `%0` 恢复。`call :label` 不新建文件上下文，`%0` 仍是当前脚本。

### 被执行还是被 dot-source

PowerShell 用 `$MyInvocation.InvocationName` 判断：dot-source 时它是 `.`，直接执行时是脚本路径或调用操作符。

```powershell title="is-dot-sourced.ps1"
if ($MyInvocation.InvocationName -eq '.') {
  Write-Output 'dot-sourced'
}
else {
  Write-Output 'executed'
}
```

```powershell title="lib.ps1"
function Get-Greeting {
  param([string]$Name)

  "hello, $Name"
}
```

```powershell title="use-lib.ps1"
. .\lib.ps1
Get-Greeting world
```

被 dot-source 的脚本运行在当前作用域：函数、变量、`Set-Location` 都会影响调用者。库文件只定义函数，不要在库文件末尾直接跑主流程。

bat 没有 dot-source。`call other.bat` 在同一个 `cmd.exe` 里运行另一个批处理，环境变量默认会带回来；如果子脚本用了 `setlocal`，`endlocal` 后修改会回滚。`call :label` 是同一个文件内的“函数”，用 `exit /b` 返回。

### `$LASTEXITCODE` 与 `$?`

```powershell title="exit-code.ps1"
& cmd /c "exit 3"
Write-Output "LASTEXITCODE=$LASTEXITCODE success=$?"

Get-ChildItem 'C:\definitely-missing' -ErrorAction SilentlyContinue
Write-Output "after cmdlet success=$?"
```

原生程序的退出码在 `$LASTEXITCODE`；Cmdlet 的成败看 `$?`。不要把 `$?` 当成数字退出码，也不要在原生程序失败后只检查 `$?` 而忽略具体退出码。

## 四、基础语法 {#syntax}

### 变量、引号与 Here-String

::: code-tabs

@tab:active PowerShell

```powershell title="quotes.ps1"
$name = 'world'
Write-Output "double: hello, $name"
Write-Output 'single: $name 不展开'
Write-Output "escape: `$name / `"quoted`" / line`nbreak"

$text = @"
hello, $name
literal: `$name
"@
Write-Output $text

$raw = @'
no expansion: $name
'@
Write-Output $raw
```

@tab bat

```bat title="quotes.bat"
@echo off
setlocal EnableExtensions
set "NAME=world"
echo double: hello, %NAME%
echo single: no special meaning
echo escape: ^& ^| ^> ^< ^^
echo percent: 100%%
exit /b 0
```

:::

PowerShell 单引号内不展开变量；双引号展开 `$变量`、`$(子表达式)`，反引号是转义符。Here-String 的 `@"` / `@'` 必须紧跟换行，结束的 `"@` / `'@` 必须单独占一行且从行首开始。

bat 没有 Here-String；`$` 在 cmd 里不是特殊字符，不需要转义。需要转义的是 `& | < > ^`，字面 `%` 写 `%%`。`set "VAR=value"` 的双引号包住整个赋值，能避免行尾空格进入变量。

### 字符串操作

::: code-tabs

@tab:active PowerShell

```powershell title="strings.ps1"
$s = 'dir/file.tar.gz'
Write-Output "len=$($s.Length)"
Write-Output "sub=$($s.Substring(4, 4))"
Write-Output "base=$([IO.Path]::GetFileName($s))"
Write-Output "noext=$([IO.Path]::GetFileNameWithoutExtension($s))"
Write-Output "replace=$($s.Replace('file', 'FILE'))"
Write-Output "regex=$($s -replace '\.tar\.gz$', '.bak')"
Write-Output "upper=$($s.ToUpper())"
Write-Output "split=$(($s -split '/') -join '|')"
Write-Output "format=$('{0} -> {1}' -f 'src', 'dst')"
```

@tab bat

```bat title="strings.bat"
@echo off
setlocal EnableExtensions
set "S=dir\file.tar.gz"
echo first3=%S:~0,3%
echo sub=%S:~4,4%
echo replace=%S:file=FILE%
echo tail=%S:~-2%
echo noext=%S:.tar.gz=%
exit /b 0
```

:::

bat 的 `%VAR:~start,length%` 是固定位置截取，`%VAR:old=new%` 是字面替换；没有正则、没有 `Split`/`Join`。复杂字符串处理应改用 PowerShell，或调用 `powershell -NoProfile -Command`。

### 算术

::: code-tabs

@tab:active PowerShell

```powershell title="arithmetic.ps1"
$n = 1
$n++
$n += 2
Write-Output "n=$n"
Write-Output "div=$([math]::Floor(7 / 2))"
Write-Output "mod=$(7 % 3)"
Write-Output "round=$([math]::Round(3.14159, 2))"
```

@tab bat

```bat title="arithmetic.bat"
@echo off
setlocal EnableExtensions
set /a n=1
set /a n+=1
set /a n+=2
echo n=%n%
set /a div=7/2
set /a mod=7%%3
echo div=%div% mod=%mod%
exit /b 0
```

:::

PowerShell 的 `/` 在不能整除时得到浮点结果（如 `7/2` 是 `3.5`），能整除时仍是整数（`6/2` 得到 `3`）；bat 的 `set /a` 只做 32 位整数运算，除法向零截断。bat 里 `%` 是变量展开符，取模要写 `%%`。

### 数组与哈希表

::: code-tabs

@tab:active PowerShell

```powershell title="collections.ps1"
$arr = @('alpha', 'beta')
$arr += 'gamma'
Write-Output "count=$($arr.Count) first=$($arr[0]) last=$($arr[-1])"

$map = @{
  Name = 'demo'
  Port = 8080
}
Write-Output "name=$($map['Name']) port=$($map.Port)"
Write-Output "keys=$(($map.Keys | Sort-Object) -join ',')"

foreach ($item in $arr) {
  Write-Output "item=$item"
}
```

@tab bat

```bat title="pseudo-arrays.bat"
@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "arr[0]=alpha"
set "arr[1]=beta"
set "arr[2]=gamma"
set "count=3"
for /l %%i in (0,1,2) do (
  echo item=!arr[%%i]!
)
set "map[Name]=demo"
set "map[Port]=8080"
echo name=!map[Name]! port=!map[Port]!
exit /b 0
```

:::

bat 没有真正的数组和哈希表，只是用带 `[]` 的变量名模拟；`set arr` 可以列出所有以 `arr` 开头的变量。需要排序、去重、嵌套结构时换 PowerShell。

### 比较运算

::: code-tabs

@tab:active PowerShell

```powershell title="compare.ps1"
Write-Output (1 -eq 1)
Write-Output ('File.TXT' -like '*.txt')
Write-Output ('abc-123' -match '^([a-z]+)-(\d+)$')
Write-Output "capture=$($Matches[1])/$($Matches[2])"
Write-Output ('a' -in @('a', 'b'))
Write-Output (@('a', 'b') -contains 'b')
```

@tab bat

```bat title="compare.bat"
@echo off
setlocal EnableExtensions
set "A=abc"
set "B=ABC"
if /i "%A%"=="%B%" echo string equal
if 3 GEQ 2 echo numeric ge
if exist "%~f0" echo file exists
if defined A echo A defined
exit /b 0
```

:::

PowerShell 的比较运算符默认不区分大小写；需要区分时用 `-ceq`、`-clike`、`-cmatch`。bat 的 `==` 区分大小写，`/i` 才忽略；数值比较用 `EQU`、`NEQ`、`LSS`、`LEQ`、`GTR`、`GEQ`。bat 没有正则，匹配文本用 `findstr /r`。

### if 与 switch

::: code-tabs

@tab:active PowerShell

```powershell title="branch.ps1"
$mode = 'start'
if ($mode -eq 'start') {
  Write-Output 'starting'
}
elseif ($mode -eq 'stop') {
  Write-Output 'stopping'
}
else {
  Write-Output 'unknown'
}

switch -Wildcard ($mode) {
  'start*' { Write-Output 'wildcard start' }
  default { Write-Output 'default' }
}
```

@tab bat

```bat title="branch.bat"
@echo off
setlocal EnableExtensions
set "MODE=%~1"
if /i "%MODE%"=="start" goto :start
if /i "%MODE%"=="stop" goto :stop
goto :usage

:start
echo starting
exit /b 0

:stop
echo stopping
exit /b 0

:usage
echo usage: %~nx0 {start^|stop} 1>&2
exit /b 2
```

:::

bat 没有 `switch`，用多个 `if ... goto :label` 模拟；标签必须唯一，`goto` 不会自动返回，函数式调用用 `call :label` + `exit /b`。

### 循环

::: code-tabs

@tab:active PowerShell

```powershell title="loops.ps1"
foreach ($item in 1..3) {
  Write-Output "foreach=$item"
}

for ($i = 0; $i -lt 3; $i++) {
  Write-Output "for=$i"
}

$i = 0
while ($i -lt 2) {
  $i++
  Write-Output "while=$i"
}

$i = 0
do {
  $i++
  Write-Output "until=$i"
} until ($i -ge 2)

1..3 | ForEach-Object { Write-Output "pipeline=$_" }
```

@tab bat

```bat title="loops.bat"
@echo off
setlocal EnableExtensions
for /l %%i in (1,1,3) do echo for-l=%%i
for %%f in (*.txt) do echo file=%%~nf
for /f "delims=" %%L in ('dir /b /s *.log 2^>nul') do echo log=%%L

set /a i=0
:loop
if %i% GEQ 2 goto :done
set /a i+=1
echo while=%i%
goto :loop
:done
exit /b 0
```

:::

PowerShell 的 `1..3` 是范围表达式；bat 的 `for /l %%i in (start,step,end)` 只能整数循环。`for /f` 读取命令输出或文件；要保留整行（包括行首空白）用 `"delims="`，`"tokens=*"` 会去掉行首空白。命令里的 `>` 要写成 `^>`，否则会被 cmd 提前解析。

### `ForEach-Object -Parallel`

<Badge type="tip" text="PS 7+" /> PowerShell 7 可以并行处理管道；5.1 用 `Start-Job` 或 `ForEach-Object` 串行。

::: code-tabs

@tab:active PowerShell

```powershell title="parallel-ps7.ps1"
1..4 | ForEach-Object -Parallel {
  Start-Sleep -Milliseconds 100
  "job $_"
} -ThrottleLimit 2
```

@tab bat

```bat title="parallel-bat.bat"
@echo off
setlocal EnableExtensions
rem bat 没有内建并行集合；start /b 后需要自己等待和收集结果。
start "" /b cmd /c "ping -n 2 127.0.0.1 >nul & echo job1"
start "" /b cmd /c "ping -n 2 127.0.0.1 >nul & echo job2"
timeout /t 3 /nobreak >nul
exit /b 0
```

:::

`ForEach-Object -Parallel` 里的脚本块运行在独立运行空间，读取外部变量要写 `$using:name`；`-ThrottleLimit` 控制并发数。输出顺序不保证。

### 函数、param 与返回值

::: code-tabs

@tab:active PowerShell

```powershell title="functions.ps1"
function Get-Sum {
  param(
    [int]$A,
    [int]$B
  )

  return ($A + $B)
}

function Get-Value {
  Write-Output 'debug'
  Write-Host 'log-only'
  return 42
}

Write-Output "sum=$(Get-Sum 2 3)"
$result = Get-Value
Write-Output "result=$($result -join ',') count=$($result.Count)"
```

@tab bat

```bat title="functions.bat"
@echo off
setlocal EnableExtensions
call :add 2 3
echo result=%ERRORLEVEL%
call :fail
echo fail=%ERRORLEVEL%
exit /b 0

:add
set /a "sum=%~1+%~2"
echo %sum%
exit /b %sum%

:fail
exit /b 1
```

:::

PowerShell 函数里**所有没有被捕获的输出都会成为返回值**：`Write-Output`、裸字符串、未赋值的表达式都会进入管道；`Write-Host` 只写宿主，不进入返回值。需要日志时用 `Write-Host` / `Write-Verbose`，或者把结果显式赋给变量。`return` 只是提前结束函数，不能撤销之前已经写入管道的输出。

bat 用 `call :label` 调用标签，`exit /b code` 返回；`%ERRORLEVEL%` 接收返回码。`goto :eof` 也能结束当前批处理/子程序，但 `exit /b` 语义更清楚。

`exit /b` 只能返回整数退出码，不能返回字符串。bat 的“返回值”通常是把结果写入调用方传入的变量名：

```bat title="return-string.bat"
@echo off
setlocal EnableExtensions
call :add 2 3 RESULT
echo result=%RESULT%

call :make-name world NAME
echo name=%NAME%
exit /b 0

:add
set /a "sum=%~1+%~2"
set "%~3=%sum%"
exit /b 0

:make-name
setlocal
set "value=hello-%~1"
endlocal & set "%~2=%value%"
exit /b 0
```

`call :add 2 3 RESULT` 把第三个参数当作结果变量名；`set "%~3=%sum%"` 把结果写回调用方。子程序需要 `setlocal` 时，用 `endlocal & set "%~2=%value%"` 跨过 `endlocal` 传值：cmd 先展开 `%value%`，再执行 `endlocal` 和 `set`。

### 输入

::: code-tabs

@tab:active PowerShell

```powershell title="input.ps1"
$name = Read-Host 'Name'
if ([string]::IsNullOrWhiteSpace($name)) {
  $name = 'world'
}
Write-Output "hello, $name"
```

@tab bat

```bat title="input.bat"
@echo off
setlocal EnableExtensions
set "NAME="
set /p "NAME=Name: "
if not defined NAME set "NAME=world"
echo hello, %NAME%
exit /b 0
```

:::

`Read-Host` 返回字符串；需要密码时用 `Read-Host -AsSecureString`。bat 的 `set /p` 在用户直接回车时不会改变变量，所以先 `set "NAME="` 清空，再判断 `if not defined`。

### 重定向与管道

::: code-tabs

@tab:active PowerShell

```powershell title="redirect.ps1"
& cmd /c "echo out & echo err 1>&2" 1> out.txt 2> err.txt
Get-Content out.txt, err.txt

& cmd /c "exit 3" *> all.txt
Get-Content all.txt

Get-ChildItem | Out-Null
Get-ChildItem | Out-File -FilePath list.txt -Encoding utf8
```

@tab bat

```bat title="redirect.bat"
@echo off
setlocal EnableExtensions
cmd /c "echo out & echo err 1>&2" > out.txt 2>&1
type out.txt
cmd /c "echo hidden" >nul 2>&1
cmd /c "echo append" >> out.txt
exit /b 0
```

:::

PowerShell 的流编号：`1` 成功、`2` 错误、`3` 警告、`4` 详细、`5` 调试、`6` 信息；`*>` 重定向所有流。`Out-Null` 丢弃成功流。`Out-File -Encoding utf8` 在 5.1 写 BOM，PowerShell 7 的 `utf8` 默认无 BOM；需要 5.1 兼容时注意。

bat 的 `>nul 2>&1` 把 stdout 和 stderr 都丢掉；顺序不能反，`2>&1 >nul` 只丢 stdout，stderr 仍会显示。

::: warning 重定向的两个 5.1 坑

1. **默认编码不同**：Windows PowerShell 5.1 的 `>` 和 `Out-File` 默认写 UTF-16 LE（带 BOM）；PowerShell 7 默认写无 BOM 的 UTF-8。需要 5.1 产出 UTF-8 时要显式 `-Encoding utf8`（5.1 仍带 BOM），不要假设两边默认一致。
2. **原生命令的 stderr 会被包装**：5.1 对原生命令做 `2>` 时，stderr 会被包装成 ErrorRecord，文件里可能出现 `NativeCommandError` 文本；如果 `$ErrorActionPreference = 'Stop'`，这会直接抛异常终止脚本。PowerShell 7.2+ 已修复；5.1 需要改用 `Start-Process -RedirectStandardError` 或让 `cmd /c ... 2>file` 自己重定向。

:::

### 延迟展开的坑

```bat title="delayed-expansion.bat"
@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "count=0"
for /l %%i in (1,1,3) do (
  set /a count+=1
  echo !count!
)
endlocal
```

::: warning 括号块里的 `%var%` 是解析时展开

cmd 会先把整个 `for (...)` 或 `if (...)` 块解析完，再执行。块里的 `%count%` 在解析时就被替换成旧值，所以上面如果写 `echo %count%`，会输出三次 `0`。开启 `setlocal EnableDelayedExpansion` 后用 `!count!`，才是执行时取值。

延迟展开也有副作用：字符串里的 `!` 会被当成变量边界，处理密码、URL、JSON 时要特别小心；不需要时及时 `endlocal`。

:::

## 五、健壮性 {#robust}

### `$ErrorActionPreference`、try/catch/finally

```powershell title="errors.ps1"
$ErrorActionPreference = 'Stop'

try {
  Get-Item 'C:\definitely-missing' -ErrorAction Stop
}
catch {
  Write-Host "caught: $($_.Exception.Message)"
}
finally {
  Write-Host 'cleanup always runs'
}
```

`$ErrorActionPreference = 'Stop'` 只影响**非终止错误**的默认行为；Cmdlet 仍可用 `-ErrorAction SilentlyContinue` 单独覆盖。`try/catch` 捕获的是 PowerShell 错误，不自动捕获原生程序的非零退出码。

### 外部命令：检查 `$LASTEXITCODE`

```powershell title="native-exit.ps1"
& cmd /c "exit 3"
if ($LASTEXITCODE -ne 0) {
  throw "native command failed: $LASTEXITCODE"
}
```

PowerShell 5.1 与 7.3 之前默认都不会因原生程序返回非零而抛异常；必须显式检查 `$LASTEXITCODE`。`$PSNativeCommandUseErrorActionPreference` 在 7.3 是实验特性，7.4 起正式可用：

```powershell title="native-preference-ps7.ps1"
$PSNativeCommandUseErrorActionPreference = $true
& cmd /c "exit 3"
```

<Badge type="tip" text="PS 7.4+" /> `$PSNativeCommandUseErrorActionPreference` 打开后，原生命令失败会按 `$ErrorActionPreference` 处理；5.1 没有这个变量，7.3 需按实验特性启用。

### `Set-StrictMode`

```powershell title="strict.ps1"
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# 下面这行会报错，而不是静默得到 $null
# Write-Output $undefinedVariable
```

`Set-StrictMode -Version Latest` 让未定义变量、不存在的属性、错误的函数调用变成错误。它适合脚本，不适合交互式探索；需要临时关闭时 `Set-StrictMode -Off`。

### 高级函数与参数校验

```powershell title="advanced-function.ps1"
function Invoke-Demo {
  [CmdletBinding(SupportsShouldProcess)]
  param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('start', 'stop')]
    [string]$Mode,

    [string]$Path = '.'
  )

  if ($PSCmdlet.ShouldProcess($Path, "Apply $Mode")) {
    Write-Host "$Mode $Path"
  }
}
```

- `[CmdletBinding()]` 让函数支持 `-Verbose`、`-ErrorAction` 等通用参数。
- `[Parameter(Mandatory = $true)]` 缺参数时交互式提示；在非交互环境会报错。
- `[ValidateSet(...)]` 限定取值，拼错时在参数绑定阶段就失败。
- `SupportsShouldProcess` + `$PSCmdlet.ShouldProcess(...)` 自动获得 `-WhatIf` / `-Confirm`。

bat 没有 `CmdletBinding`、参数绑定和 `ShouldProcess`：等价做法是用 `if` / `if defined` 手动校验参数，把危险操作放到 `:label` 前先打印预览；完整骨架见本章末尾的 bat 模板。

### 日志函数

```powershell title="log.ps1"
function Write-Log {
  param(
    [string]$Level,
    [string]$Message
  )

  $time = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Write-Host ('{0} [{1}] {2}' -f $time, $Level, $Message)
}

Write-Log INFO 'start'
Write-Log ERROR 'failed'
```

日志写宿主（`Write-Host`）或信息流，不要用 `Write-Output`，否则会混进函数返回值，破坏调用者的管道。

bat 等价做法是 `echo %DATE% %TIME% [INFO] message` 并用 `>>` 追加到文件；没有对象流，也没有级别过滤，复杂日志应调用 PowerShell 或专用日志程序。

### bat 的错误处理

```bat title="errors.bat"
@echo off
setlocal EnableExtensions
some-command.exe
if errorlevel 1 (
  echo failed 1>&2
  exit /b 1
)

some-other.exe || (
  echo failed 1>&2
  exit /b 1
)
exit /b 0
```

`if errorlevel 1` 判断“大于等于 1”，不是“等于 1”；要精确比较用 `if %ERRORLEVEL% EQU 1`。`||` 在前一条命令失败时执行，`&&` 在成功时执行；括号块里的 `%ERRORLEVEL%` 可能被提前展开，必要时用 `!ERRORLEVEL!`。

### 完整模板：PowerShell 版

```powershell title="template.ps1"
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
  [string[]]$Path,

  [string]$OutFile
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log {
  param([string]$Level, [string]$Message)

  $time = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Write-Host ('{0} [{1}] {2}' -f $time, $Level, $Message)
}

$temp = Join-Path $env:TEMP ('tool-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp | Out-Null

try {
  foreach ($item in $Path) {
    Write-Log INFO "arg=$item"
  }

  if ($OutFile) {
    Set-Content -LiteralPath $OutFile -Value 'done' -Encoding UTF8
    Write-Log INFO "wrote $OutFile"
  }
}
catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
}
finally {
  Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
}
```

### 完整模板：bat 版

```bat title="template.bat"
@echo off
setlocal EnableExtensions
call :main %*
exit /b %ERRORLEVEL%

:usage
echo usage: %~nx0 [-o FILE] ARG... 1>&2
exit /b 2

:main
set "OUT="

:parse
if "%~1"=="" goto :done
if /i "%~1"=="-o" goto :set-out
echo arg=%~1
shift
goto :parse

:set-out
if "%~2"=="" goto :usage
set "OUT=%~2"
shift
shift
goto :parse

:done
if defined OUT echo writing to "%OUT%"
exit /b 0
```

bat 模板用标签跳转解析参数，避免在括号块里 `shift` 导致 `%1` 提前展开。需要 `-WhatIf`、复杂参数校验或 JSON 处理时，直接用 PowerShell 模板。

## 六、文本与文件处理 {#text}

### 文件枚举与内容读取

::: code-tabs

@tab:active PowerShell

```powershell title="files.ps1"
Get-ChildItem -Path . -Recurse -Filter '*.log' |
  Select-Object FullName, Length, LastWriteTime

$text = Get-Content -Path .\app.log -Raw -Encoding UTF8
Write-Output $text

Get-Content -Path .\app.log -TotalCount 5
Get-Content -Path .\app.log -Tail 5

Set-Content -Path .\out.txt -Value 'hello' -Encoding UTF8
```

@tab bat

```bat title="files.bat"
@echo off
setlocal EnableExtensions
dir /s /b *.log
type app.log
more app.log
find /c /v "" app.log
echo hello> out.txt
exit /b 0
```

:::

PowerShell 的 `Get-Content -Raw` 一次读成单个字符串，适合 `-replace` / JSON；不加 `-Raw` 是逐行数组。`-TotalCount` / `-Tail` 在 5.1 可用。bat 的 `more` 只能分页，没有可靠的 head/tail；`find /c /v ""` 统计行数。

### 搜索与替换

::: code-tabs

@tab:active PowerShell

```powershell title="search.ps1"
Select-String -Path .\*.log -Pattern 'error' -CaseSensitive:$false

$text = Get-Content -Raw .\app.log
$text -replace 'old', 'new' | Set-Content -Path .\app.new -Encoding UTF8

Select-String -Path .\*.log -Pattern '^(ERROR|WARN)' |
  Select-Object Path, LineNumber, Line
```

@tab bat

```bat title="search.bat"
@echo off
setlocal EnableExtensions
findstr /s /i /n /c:"error" *.log
findstr /r /c:"^ERROR" /c:"^WARN" *.log
exit /b 0
```

:::

`Select-String` 返回 MatchInfo 对象，带 `Path`、`LineNumber`、`Line`；`-replace` 是正则替换，字面替换用 `.Replace()`。bat 的 `findstr` 支持 `/s` 递归、`/i` 忽略大小写、`/n` 行号、`/c:` 字面串、`/r` 正则（功能有限）。

### 排序、分组、去重、统计

::: code-tabs

@tab:active PowerShell

```powershell title="aggregate.ps1"
Get-ChildItem -File | Sort-Object Length -Descending | Select-Object -First 5

Get-ChildItem -File | Group-Object Extension |
  Sort-Object Count -Descending

'a', 'b', 'a' | Select-Object -Unique
Get-ChildItem -File | Measure-Object -Property Length -Sum -Average
```

@tab bat

```bat title="aggregate.bat"
@echo off
setlocal EnableExtensions
dir /b *.log | sort
dir /b *.log | find /c /v ""
exit /b 0
```

:::

bat 没有 `Group-Object` / `Measure-Object` 的直接等价物；统计行数用 `find /c /v ""`，排序用 `sort`，去重需要先 `sort` 再自己用 `if` 比较相邻行。

### JSON 与 CSV

::: code-tabs

@tab:active PowerShell

```powershell title="json-csv.ps1"
$data = Get-Content -Raw .\data.json | ConvertFrom-Json
Write-Output $data.name

$data | ConvertTo-Json -Depth 10 | Set-Content -Path .\out.json -Encoding UTF8

Import-Csv .\users.csv |
  Where-Object { $_.Enabled -eq 'true' } |
  Export-Csv .\enabled.csv -NoTypeInformation -Encoding UTF8
```

@tab bat

```bat title="json-csv.bat"
@echo off
setlocal EnableExtensions
rem bat 没有 JSON/CSV 解析器；调用 PowerShell 或外部 exe。
powershell -NoProfile -Command "$d = Get-Content -Raw .\data.json | ConvertFrom-Json; $d.name"
exit /b %ERRORLEVEL%
```

:::

`ConvertTo-Json` 默认只展开 2 层，嵌套对象要显式 `-Depth`；`Export-Csv -NoTypeInformation` 避免写入 `#TYPE` 行。bat 处理 JSON/CSV 应调用 PowerShell、`jq` 或其他专用工具，不要用字符串拼接硬解析。

### Unix 命令对照

| 任务 | Unix | PowerShell | bat |
| :-- | :-- | :-- | :-- |
| 递归搜索 | `grep -RIn 'error' .` | `Get-ChildItem -Recurse -File \| Select-String 'error'` | `findstr /s /i /n /c:"error" *` |
| 查找文件 | `find . -name '*.log'` | `Get-ChildItem -Recurse -Filter *.log` | `dir /s /b *.log` |
| 替换 | `sed 's/old/new/g' file` | `(Get-Content -Raw file) -replace 'old','new'` | 无直接等价；变量内用 `%VAR:old=new%` |
| 查看文件 | `cat file` | `Get-Content file` | `type file` |
| 统计行数 | `wc -l file` | `(Get-Content file).Count` | `find /c /v "" file` |
| 前 N 行 | `head -n 10 file` | `Get-Content file -TotalCount 10` | 无直接等价 |
| 后 N 行 | `tail -n 10 file` | `Get-Content file -Tail 10` | 无直接等价 |
| 逐项处理 | `xargs -n 1 cmd` | `ForEach-Object { cmd $_ }` | `for %%i in (...) do cmd %%i` |
| 查找命令 | `which cmd` | `Get-Command cmd` | `where cmd` |
| 列目录 | `ls -la` | `Get-ChildItem -Force` | `dir /a` |
| 递归删除 | `rm -rf dir` | `Remove-Item -Recurse -Force dir` | `rmdir /s /q dir` |
| 递归复制 | `cp -r src dst` | `Copy-Item -Recurse src dst` | `xcopy /e /i src dst` |
| 移动/改名 | `mv a b` | `Move-Item a b` | `move a b` |
| 设置环境变量 | `export NAME=value` | `$env:NAME = 'value'` | `set NAME=value` |
| 列出环境变量 | `env` | `Get-ChildItem Env:` | `set` |
| 查看进程 | `ps aux` | `Get-Process` | `tasklist` |
| 结束进程 | `kill -TERM PID` | `Stop-Process -Id PID` | `taskkill /PID PID` |
| 下载 | `curl -fL URL -o out` | `Invoke-WebRequest -Uri URL -OutFile out` | `curl.exe -fL URL -o out` |
| 排序 | `sort file` | `Get-Content file \| Sort-Object` | `sort file` |
| 去重 | `sort file \| uniq` | `Get-Content file \| Sort-Object -Unique` | 无直接等价 |

PowerShell 5.1 里 `curl` 和 `wget` 是 `Invoke-WebRequest` 的别名，不是原生 curl/wget；要调真正的 curl 写 `curl.exe`。PowerShell 7 一般不再提供这两个别名，`curl` 会解析到 `curl.exe`。

## 七、进程与系统 {#process}

### 启动进程与等待

::: code-tabs

@tab:active PowerShell

```powershell title="start-process.ps1"
$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'exit 3' -Wait -PassThru -NoNewWindow
Write-Output "exit=$($p.ExitCode)"

Start-Process -FilePath 'notepad.exe' -ArgumentList '.\app.log'
```

@tab bat

```bat title="start-process.bat"
@echo off
setlocal EnableExtensions
start "" /wait cmd /c "exit 3"
echo exit=%ERRORLEVEL%
start "" notepad.exe app.log
exit /b 0
```

:::

`Start-Process -Wait` 等进程结束；`-PassThru` 返回进程对象，才能读 `.ExitCode`。不加 `-Wait` 时立即返回，适合启动 GUI。bat 的 `start /wait` 等价于等待，`start` 不加 `/wait` 是异步。

### 后台任务与并行

::: code-tabs

@tab:active PowerShell

```powershell title="jobs.ps1"
$job = Start-Job -ScriptBlock {
  Start-Sleep -Seconds 1
  'done'
}

Wait-Job -Job $job -Timeout 5 | Out-Null
Receive-Job -Job $job
Remove-Job -Job $job
```

@tab bat

```bat title="jobs.bat"
@echo off
setlocal EnableExtensions
start "" /b cmd /c "ping -n 2 127.0.0.1 >nul & echo job1"
start "" /b cmd /c "ping -n 2 127.0.0.1 >nul & echo job2"
timeout /t 3 /nobreak >nul
exit /b 0
```

:::

`Start-Job` 在独立 PowerShell 进程/运行空间里执行，启动有开销；`Receive-Job` 取输出，`Remove-Job` 清理。PowerShell 7 的 `ForEach-Object -Parallel` 更轻量，但不是线程安全的，共享状态要加锁或避免。

bat 的 `start /b` 只保证异步启动，没有内建的“等待全部”机制；简单场景用固定 `timeout` 等待，严谨场景要用 PID 列表 + `tasklist` 轮询。

### 超时

::: code-tabs

@tab:active PowerShell

```powershell title="timeout.ps1"
$job = Start-Job -ScriptBlock { Start-Sleep -Seconds 30 }
if (-not (Wait-Job -Job $job -Timeout 2)) {
  Write-Host 'timed out'
  Stop-Job -Job $job
}
Remove-Job -Job $job -Force

$p = Start-Process -FilePath 'ping.exe' -ArgumentList '127.0.0.1', '-n', '30' -PassThru
try {
  Wait-Process -Id $p.Id -Timeout 2 -ErrorAction Stop
}
catch {
  Write-Host 'process timed out'
  Stop-Process -Id $p.Id -Force
}
```

@tab bat

```bat title="timeout.bat"
@echo off
setlocal EnableExtensions
rem timeout /t 是“等待 N 秒”，不是“最多运行 N 秒”。
timeout /t 2 /nobreak >nul
exit /b 0
```

:::

`Wait-Job -Timeout` 超时返回 `$null`，不抛异常；`Wait-Process -Timeout` 超时会抛错，配合 `-ErrorAction Stop` 捕获。bat 的 `timeout /t` 只是延迟；要限制子进程运行时间，需要 `start` 记录 PID，再用 `tasklist` / `taskkill` 轮询。

### 检测系统、命令与权限

::: code-tabs

@tab:active PowerShell

```powershell title="system.ps1"
$PSVersionTable.PSVersion
[Environment]::OSVersion.VersionString
Write-Output "OS=$env:OS"

if (Get-Command git -ErrorAction SilentlyContinue) {
  Write-Output 'git found'
}

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
$isAdmin = $principal.IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)
Write-Output "admin=$isAdmin"
```

@tab bat

```bat title="system.bat"
@echo off
setlocal EnableExtensions
ver
echo OS=%OS%

where git >nul 2>&1
if errorlevel 1 (
  echo git missing 1>&2
) else (
  echo git found
)

net session >nul 2>&1
if errorlevel 1 (
  echo not admin
) else (
  echo admin
)
exit /b 0
```

:::

<Badge type="tip" text="PS 7+" /> PowerShell 7 可以直接用 `$IsWindows` / `$IsLinux` / `$IsMacOS`；5.1 只有 Windows，判断系统用 `$env:OS` 或 `[Environment]::OSVersion`。

### 自提权

```powershell title="elevate.ps1"
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
$isAdmin = $principal.IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
  Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', ('"{0}"' -f $PSCommandPath)
  )
  exit
}

Write-Host 'already elevated'
```

`-Verb RunAs` 会弹 UAC；用户拒绝时 `Start-Process` 抛错。用 `powershell.exe` 提权后运行的是 5.1，即使当前是 `pwsh`；需要 7 就把 `-FilePath` 换成 `pwsh.exe` 并确保已安装。

bat 没有直接等价物：可以在 bat 里调用 `powershell -NoProfile -Command "Start-Process ... -Verb RunAs"`，或用 `runas /user:Administrator`；后者会新开窗口、不能直接传复杂参数，且需要输入密码。

### 计划任务

::: code-tabs

@tab:active PowerShell

```powershell title="schedule.ps1"
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument '-NoProfile -File C:\Tools\backup.ps1'
$trigger = New-ScheduledTaskTrigger -Daily -At '03:30'
$principal = New-ScheduledTaskPrincipal `
  -UserId "$env:USERDOMAIN\$env:USERNAME" `
  -LogonType Interactive

Register-ScheduledTask -TaskName 'Backup' `
  -Action $action -Trigger $trigger -Principal $principal -Force
```

@tab bat

```bat title="schedule.bat"
@echo off
setlocal EnableExtensions
schtasks /create /tn "Backup" ^
  /tr "powershell.exe -NoProfile -File C:\Tools\backup.ps1" ^
  /sc daily /st 03:30 /f
exit /b %ERRORLEVEL%
```

:::

计划任务的启动工作目录默认是 `C:\Windows\System32`，用户环境、网络盘符也可能和手动运行不同；`$PSScriptRoot` 仍然是脚本所在目录，但脚本里要用绝对路径，并显式 `Set-Location` 到需要的工作目录。上面的 `LogonType Interactive` 只在用户登录时运行；要不登录也运行，需改用 `S4U`、`Password` 或 `SYSTEM` 等凭据。为当前用户创建任务通常不需要管理员；`-RunLevel Highest`、SYSTEM 账户、为其他用户创建任务才需要管理员。

## 八、一行命令速查 {#cheatsheet}

### 文件

| 场景 | 命令 |
| :-- | :-- |
| 列目录 | `Get-ChildItem` |
| 递归找日志 | `Get-ChildItem -Recurse -Filter *.log` |
| 复制目录 | `Copy-Item -Recurse src dst` |
| 删除目录 | `Remove-Item -Recurse -Force dir` |
| 建目录 | `New-Item -ItemType Directory -Force dir` |
| 查看文件 | `Get-Content file -TotalCount 20` |
| 文件大小 | `(Get-Item file).Length` |

### 文本

| 场景 | 命令 |
| :-- | :-- |
| 搜索 | `Select-String -Path *.log -Pattern error` |
| 替换输出 | `(Get-Content -Raw f) -replace 'a','b'` |
| 排序 | `Get-Content f \| Sort-Object` |
| 去重 | `Get-Content f \| Select-Object -Unique` |
| 统计行 | `(Get-Content f).Count` |
| 前 10 行 | `Get-Content f -TotalCount 10` |
| 后 10 行 | `Get-Content f -Tail 10` |

### 网络与端口

| 场景 | 命令 |
| :-- | :-- |
| 查监听端口 | `Get-NetTCPConnection -LocalPort 8080 -State Listen` |
| netstat 查端口 | `netstat -ano \| findstr :8080` |
| 测端口 | `Test-NetConnection example.com -Port 443` |
| 下载 | `Invoke-WebRequest -Uri https://example.com/a.zip -OutFile a.zip` |
| 只看头 | `Invoke-WebRequest -Uri https://example.com -Method Head` |

### 下载重试

```powershell title="download-retry.ps1"
$uri = 'https://example.com/a.zip'
$out = 'a.zip'

for ($i = 1; $i -le 3; $i++) {
  try {
    Invoke-WebRequest -Uri $uri -OutFile $out -UseBasicParsing
    break
  }
  catch {
    if ($i -eq 3) { throw }
    Start-Sleep -Seconds 2
  }
}
```

`-UseBasicParsing` 在 PowerShell 6+ 仍被接受，只是已废弃、没有实际作用；保留它可以兼容 5.1，不会报“参数不存在”。

### 进程

| 场景 | 命令 |
| :-- | :-- |
| 查进程 | `Get-Process notepad` |
| 按名称结束 | `Stop-Process -Name notepad -Force` |
| 按 PID 结束 | `Stop-Process -Id 1234 -Force` |
| taskkill | `taskkill /PID 1234 /F` |
| 查命令行 | `Get-CimInstance Win32_Process -Filter "Name='notepad.exe'"` |

### JSON

| 场景 | 命令 |
| :-- | :-- |
| 读字段 | `(Get-Content -Raw data.json \| ConvertFrom-Json).name` |
| 写 JSON | `$obj \| ConvertTo-Json -Depth 10 \| Set-Content out.json` |
| 过滤 | `Get-Content -Raw data.json \| ConvertFrom-Json \| Where-Object { $_.enabled }` |

### 彩色输出

| 场景 | 命令 |
| :-- | :-- |
| 红色文字 | `Write-Host 'error' -ForegroundColor Red` |
| 绿底黑字 | `Write-Host 'ok' -ForegroundColor Black -BackgroundColor Green` |
| bat 整屏配色 | `color 0C` |

Windows 10 起 conhost / Windows Terminal 支持 ANSI 转义序列，bat 可以逐行着色；`color` 仍然只能改整个控制台窗口。先取 ESC 字符：

```bat title="color-ansi.bat"
@echo off
setlocal EnableExtensions
for /f %%e in ('echo prompt $E^| cmd') do set "ESC=%%e"
echo %ESC%[31merror%ESC%[0m
echo %ESC%[32mok%ESC%[0m
exit /b 0
```

### 环境变量持久化

| 场景 | 命令 |
| :-- | :-- |
| 当前进程 | `$env:NAME = 'value'` |
| 用户级持久化 | `[Environment]::SetEnvironmentVariable('NAME','value','User')` |
| 系统级持久化 | `[Environment]::SetEnvironmentVariable('NAME','value','Machine')`（需管理员） |
| setx | `setx NAME value` |

`setx` 只影响之后新开的进程，当前窗口不会立即生效；值超过 1024 个字符会被截断，长 PATH 或长 JSON 不要用 `setx`，改用 `[Environment]::SetEnvironmentVariable`。

### 批量重命名与日期

| 场景 | 命令 |
| :-- | :-- |
| 改扩展名 | `Get-ChildItem *.jpg \| ForEach-Object { Rename-Item $_.FullName ($_.Name -replace '\.jpg$','.jpeg') }` |
| 加前缀 | `Get-ChildItem *.log \| ForEach-Object { Rename-Item $_.FullName ('old-' + $_.Name) }` |
| 当前时间 | `Get-Date -Format 'yyyy-MM-dd HH:mm:ss'` |
| ISO 时间 | `Get-Date -Format o` |
| bat 改扩展名 | `for %%f in (*.jpg) do ren "%%f" "%%~nf.jpeg"` |

批量重命名前先 `ForEach-Object { Write-Host $_.Name }` 预览；`Rename-Item` 遇到同名目标会报错，不会自动覆盖。

表里的 `%%f` 是批处理文件内的写法；在 cmd 交互式命令行直接输入时写 `%f`。

## 九、对照 Unix {#unix}

Unix 下的 sh/bash 写法、特殊变量与常用命令见[Shell 脚本编写指南：sh 与 bash 写法对照与命令速查](../linux/shell-script.md)。
