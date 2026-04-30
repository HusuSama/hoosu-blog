# Vuepress Plume 主题文档（AI 编写指南）

本指南为 AI 在本博客中编写文档时的速查手册。基于 `vuepress-theme-plume`（VuePress next）。
**目标：让 AI 准确使用 Plume 提供的扩展能力，写出排版美观、信息密度合理的文章。**

> 写作时遵循「内容优先 → 结构清晰 → 适度修饰」三步原则。不要堆砌组件，每个增强都应服务于阅读体验。

---

## 一、文章基础

### 1. 文件命名

- 文件名形如 `1.前端.md`、`2.后端.md`，前缀数字仅作排序，不会出现在 URL 中。
- 集合（collections）分两类：`post`（博客文章）与 `doc`（文档）。

### 2. Frontmatter（YAML 头部）

放置在文件开头 `---` 之间。常用字段：

```yaml
---
title: 文章标题 # 缺省时由 autoFrontmatter 生成
createTime: 2025/04/30 10:00
permalink: /article/xxx/
tags: [Vue, 前端]
sticky: 1 # 置顶（数字越大越靠前）
draft: false
---
```

- 启用 autoFrontmatter 时，正文从 `## 二级标题` 开始；禁用时从 `# 一级标题` 开始。
- 不要手写 `permalink`，留给主题自动生成更稳妥。

---

## 二、Markdown 基础与扩展（默认启用）

### 1. 标准语法

标题 `#`~`######`、引用 `>`、列表 `-` / `1.`、分隔线 `---`、链接 `[t](url)`、图片 `![alt](url)`、强调 `**粗**` `*斜*`、行内代码 `` ` ``、表格（`:-` 左、`:-:` 中、`-:` 右对齐）。

### 2. 自定义锚点

```markdown
## 章节标题 {#custom-anchor}
```

### 3. 上下角标 / 任务列表 / 脚注 / 目录

```markdown
H~2~O，10^2^

- [x] 已完成
- [ ] 待办
      脚注：参考[^1]
      [^1]: 这是脚注内容

[[TOC]]
```

### 4. 属性写法（attrs）

紧跟在元素后或下一行，以 `{}` 形式附加 class、id 或属性：

```markdown
[链接](url){.btn target=\_blank}
段落内容{.note}
```

表格单元格支持 `{rowspan=2 colspan=2}` 合并。

### 5. 对齐容器

```markdown
::: center
居中文字
:::
```

还支持 `::: left` 与 `::: right`。

### 6. 马克笔（高亮文字）

```markdown
==默认高亮==
==成功=={.tip} ==警告=={.warning} ==危险=={.danger}
==重要=={.important} ==信息=={.info} ==提示=={.note} ==注意=={.caution}
```

### 7. 图标（iconify）

```markdown
::twemoji:astonished-face::
::mdi:home =20 /#f00:: // 大小 20、颜色 #f00
```

配置 `markdown.icon.prefix` 后可省略前缀（如 `::home::`）。
推荐用 `twemoji:`（彩色 emoji）、`mdi:`（Material Design）、`carbon:`（IBM）。

### 8. 内部链接

支持 permalink、相对路径、绝对路径（自 sourceDir）。优先用 permalink。

### 9. 文件导入

```markdown
<!-- @include: ./snippet.md -->
<!-- @include: ./snippet.md{10-20} -->
<!-- @include: ./snippet.md#region-name -->
```

---

## 三、提示与警报

### 1. 提示容器

```markdown
::: tip 小贴士
内容
:::
```

可用：`note` `info` `tip` `warning` `caution` `details`（折叠详情）。

### 2. GitHub 风格警报

```markdown
> [!NOTE]
> 普通说明
> [!TIP]
> 提示
> [!IMPORTANT]
> 重点
> [!WARNING]
> 警告
> [!CAUTION]
> 严重警告
```

**写作建议**：常规说明用 `tip`/`note`；阻断性问题用 `warning`/`caution`；可隐藏次要内容用 `details`。

---

## 四、卡片体系（构建美观文档的核心）

### 1. 单卡 / 卡片网格

```markdown
::: card title="组件名" icon="twemoji:rocket"
卡片内容支持 **markdown**。
:::

:::: card-grid
::: card title="A" icon="mdi:react"
卡片 A
:::
::: card title="B" icon="mdi:vuejs"
卡片 B
:::
::::
```

### 2. 链接卡片 / 图片卡片 / 仓库卡片（Vue 组件）

```markdown
<LinkCard title="VuePress" icon="vscode-icons:file-type-vue" href="https://vuepress.vuejs.org/" description="静态站点生成器" />

<ImageCard image="/cover.jpg" title="标题" description="说明" author="作者" date="2025-04-30" href="/post/" center />

<RepoCard repo="vuejs/core" provider="github" />
```

> RepoCard 与 Swiper 需在 `.vuepress/client.ts` 中显式注册或导入。

### 3. CardGrid / CardMasonry

```markdown
<CardGrid :cols="3">
  <Card title="一" icon="mdi:numeric-1" />
  <Card title="二" icon="mdi:numeric-2" />
  <Card title="三" icon="mdi:numeric-3" />
</CardGrid>

::: card-masonry cols="3" gap="16"
（瀑布流子内容：图片、卡片、代码块均可）
:::
```

- `cols` 支持响应式对象 `{ sm:1, md:2, lg:3 }`。建议 ≤ 3 列。
- markdown 与组件标签之间务必空一行。

---

## 五、结构化展示组件

### 1. 步骤

```markdown
::: steps

1. 第一步说明
2. 第二步说明
   - 子要点
3. 第三步说明
   :::
```

### 2. 文件树

```markdown
::: file-tree icon="colored" title="项目结构"

- src
  - components
    - Button.vue ++ # 新增
    - Old.vue -- # 删除
  - utils/ # 空目录
- README.md **重点**
  :::
```

### 3. 代码树（需开启 `markdown.codeTree: true`）

````markdown
::: code-tree title="示例" entry="src/index.ts"

```ts title="src/index.ts" :active
console.log("hi");
```
````

```ts title="src/utils.ts"
export const add = (a, b) => a + b;
```

:::

````

### 4. 选项卡 / 代码分组
```markdown
::: tabs#frame
@tab:active Vue
Vue 内容
@tab React
React 内容
:::

::: code-tabs
@tab:active pnpm
```sh
pnpm install
````

@tab npm

```sh
npm install
```

:::

````
- `tabs#id` 相同 id 的多个 tabs 切换会同步。

### 5. 时间线（需开启 `markdown.timeline: true`）
```markdown
::: timeline card placement=between line=dashed
- v1.0.0 发布
  time=2025-03-20 type=success icon=mdi:rocket

  正式版上线，支持核心功能。
- v0.9.0 内测
  time=2025-02-10 type=info

  内测版本，开放部分功能。
:::
````

- `type`：info / tip / success / warning / danger / caution / important。

### 6. 折叠面板（需开启 `markdown.collapse: true`）

```markdown
::: collapse accordion

- :+ 默认展开项

  内容 A

- :- 默认折叠项

  内容 B
  :::
```

### 7. 字段容器（需开启 `markdown.field: true`）

适合描述配置项 / Props：

```markdown
:::: field-group
::: field name="title" type="string" required
卡片标题
:::
::: field name="icon" type="string" optional default="''"
图标名（iconify）
:::
::::
```

### 8. 示例容器 / Flex 容器

```markdown
::: window title="示例" height="240px"
（图片、html、组件演示）
:::

::: flex center center gap="16"

- 子项 A
- 子项 B
- 子项 C
  :::
```

---

## 六、特殊扩展（按需开启）

| 扩展       | 配置开关                           | 用法摘要                                                      |
| ---------- | ---------------------------------- | ------------------------------------------------------------- |
| 数学公式   | `markdown.math: { type: 'katex' }` | 行内 `$E=mc^2$`、块级 `$$...$$`                               |
| 二维码     | `markdown.qrcode: true`            | 行内 `@[qrcode](text)` 或 `::: qrcode card title="" :::`      |
| 包管理切换 | `markdown.npmTo: true`             | `::: npm-to` 包裹 npm 命令块，自动生成 npm/yarn/pnpm/bun tabs |
| 对话记录   | `markdown.chat: true`              | `::: chat` + `{:date}` `{username}` `{.}`(本人)               |
| 隐秘文本   | `markdown.plot: true`              | `!!隐藏内容!!{.click}` 触发显示                               |
| 内容注释   | `markdown.annotation: true`        | `[+label]` 占位 + `[+label]: 内容` 定义                       |

---

## 七、代码块增强

````markdown
```ts title="utils.ts" {2,4-6} :line-numbers=1 :collapsed-lines=15
import { ref } from "vue"; // [!code highlight]
const a = 1; // [!code ++]
const b = 2; // [!code --]
const c = 3; // [!code focus]
const d = 4; // [!code warning]
const e = 5; // [!code error]
// [!code word:Hello]
console.log("Hello world");
```
````

要点：

- `title="..."` 显示文件名标题。
- `{1,3-5}` 行高亮；`:line-numbers` / `:no-line-numbers` 控制行号。
- 注释指令：`highlight` / `++` / `--` / `focus` / `warning` / `error` / `word:xxx`。
- `:collapsed-lines=10` 折叠超长代码（默认 15 行起折叠）。

---

## 八、首页定制（README.md）

通过 frontmatter `home: true` + `config[]` 描述各区块。常用 type：

| type                        | 用途                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- |
| `banner`                    | 顶部大图横幅，含 `hero.name/tagline/text/actions[]`                              |
| `hero`                      | 内置动效背景（`prism` / `liquid-ether` / `dot-grid` / `beams` / `lightning` 等） |
| `doc-hero`                  | 含 `image`（支持 light/dark 双图）                                               |
| `features`                  | 特性卡片网格，`features[].icon/title/details/link`                               |
| `text-image` / `image-text` | 左右图文                                                                         |
| `posts`                     | 文章列表（`collection: 'blog'`）                                                 |
| `profile`                   | 个人介绍（avatar、name、description、circle）                                    |
| `custom`                    | 渲染 README.md 中的 markdown 内容                                                |

每个区块可设：`full`、`backgroundImage`（含 `light/dark`）、`backgroundAttachment`。
actions 项支持 `theme: 'brand'|'alt'`、`icon`、`suffixIcon`、`target`、`rel`。

---

## 九、内置组件速查

### Badge

```markdown
<Badge type="tip" text="v2.0" />
<Badge type="warning" text="实验" />
```

type：`info` / `tip` / `warning` / `danger` 或自定义 class。

### Card 系列

- `<Card>`：通用卡片，slots: `default`、`title`。
- `<LinkCard>`：外链卡片。
- `<ImageCard>`：图文展示卡。
- `<RepoCard>`：GitHub / Gitee 仓库信息卡。
- `<CardGrid>` / `<CardMasonry>`：响应式排列容器。

### Swiper（需安装 `swiper` 包并注册）

```vue
<Swiper :items="['/a.jpg', '/b.jpg']" mode="banner" effect="fade" loop />
```

mode：`banner` / `carousel` / `broadcast`。
effect：`slide` / `fade` / `cube` / `coverflow` / `flip` / `cards` / `creative`。

---

## 十、AI 写作准则

1. **结构先行**：长文先用 `[[TOC]]` 或 `## 二级标题` 拆段。
2. **优先使用容器而非纯 HTML**：能用 `::: tip` 就不用 `<div class="tip">`。
3. **图标统一 iconify**：风格保持一致，emoji 类用 `twemoji:`，UI 类用 `mdi:` / `carbon:`。
4. **强调有度**：每屏不超过 1~2 处马克笔高亮；警报容器用于关键内容。
5. **代码块必带 `title=""`并包含文件扩展名**：多文件示例改用 `code-tabs` 或 `code-tree`。
6. **卡片网格用于横向并列**：步骤性内容用 `::: steps`；时间顺序用 `::: timeline`；可折叠次要细节用 `::: details` 或 `::: collapse`。
7. **配置类内容**：用 `:::: field-group` + `::: field` 描述字段，比纯表格更直观。
8. **嵌套容器**：外层用 `::::`，内层用 `:::` 区分；容器内 markdown 与块标签间须空行。
9. **未启用功能**：使用 `timeline` / `collapse` / `chat` / `plot` / `annotation` / `qrcode` / `npmTo` / `codeTree` / `field` / `math` 前，先确认 `.vuepress/config.ts` 中 `plumeTheme.markdown` 已开启对应开关。
10. **首页只放骨架**：README.md 用 `home: true` + `config[]` 组合区块，不要塞入大段正文，正文请放到独立文章。

---

**IMPORTANT**: 写入 markdown 时，必须使用简体中文！
