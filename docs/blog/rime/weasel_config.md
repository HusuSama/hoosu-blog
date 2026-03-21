---
title: 小狼毫输入法配置
createTime: 2026/01/24 11:28:26
permalink: /blog/9j7q1vvk/
tag:
  - rime
---

## 查找配置

大部分配置都可以直接在文件中查看，比如 `default.yaml`、`weasel.yaml` 等

## 小狼毫配置速览

[weasel.yaml](https://github.com/rime/weasel/wiki/weasel.yaml-%E9%80%9F%E6%9F%A5)

[schema.yaml/dict.yaml](https://github.com/LEOYoon-Tsaw/Rime_collections/blob/master/Rime_description.md)

## 安装和使用雾凇拼音

这里不再编写有关程序安装的事项，而是说明一下注意的事项

- 安装雾凇拼音时，最好是进行手动安装或者 `git` 下载安装，而不要使用 `rime` 的安装程序进行
- 安装 `rime` 的时候可以选择配置存放位置，最好是配置一下
- 下载好的雾凇拼音配置，直接放到配置目录下，然后重新部署一下即可


## 简单的皮肤创建

针对 `Windows` 的小狼毫，可以在[这里](https://owlzou.github.io/weasel-theme-editor/)尝试进行简单的自定义操作

## 配置文件

在你的配置路径下，可以找到一些配置的文件，主要需要关注下面的几个文件

- `default.custom.yaml` ：可以进行一些基础的配置，比如快捷键等
- `<你的拼音>.schema.yaml` ：针对当前输入的配置，某些可以必须在这里进行，比如配置输入法默认等关于这个输入方案的配置
- `weasel.custom.yaml` ：可以对你的输入法进行一些定制操作，在其他系统上，文件是 `squirrel` 之类的，一般用于记性输入法样式等定制

## `weasel.custom.yaml` 文件配置


```toml title="weasel.custom.yaml"
customization:
  distribution_code_name: Weasel
  distribution_version: 0.17.4
  generator: "Weasel::UIStyleSettings"
  modified_time: "Sat Jan 24 09:16:09 2026"
  rime_version: 1.13.1
patch:
  show_notifications_time: 200  # 中英文切换时提示显示的时间
  # "style/color_scheme": lost_temple
  app_options:    # 关于特定程序的配置
    Zed.exe:
      acsii_mode: true  # 默认进入是英文状态
      vim_mode: true  # 开启 vim 模式，在按 `esc` 后，会自动切换到英文模式
    neovide.exe:
      ascii_mode: true
      vim_mode: true
  # 这里是一些输入法样式设置
  style:
    color_scheme: cappuccin_macchiato_mauve
    font_face: Maple Mono NL NF CN
    font_point: 12
    horizontal: true
    inline_preedit: true
    preedit_type: composition
    display_tray_icon: false
    label_format: "%s."
    layout:
      min_width: 100
      min_height: 8
      border_width: 1
      margin_x: 11
      margin_y: 9
      spacing: 10
      candidate_spacing: 10
      hilite_spacing: 5
      hilite_padding_x: 6
      hilite_padding_y: 6
      round_corner: 6
      shadow_offset_x: 1
      shadow_offset_y: 1
      shadow_radius: 5
  preset_color_schemes/cappuccin_macchiato_mauve:
    name: My Theme
    author: "-"
    border_color: "0xeaeaea"
    hilited_comment_text_color: "0xffffff"
    hilited_candidate_text_color: "0xffffff"
    hilited_candidate_back_color: "0xe37200"
    shadow_color: "0xc1c1c1"
```

## 配置快捷键和按键行为

配置这个需要在 `default.custom.yaml` 文件中进行

```toml title="default.custom.yaml"
customization:
  distribution_code_name: Weasel
  distribution_version: 0.17.4
  generator: "Rime::SwitcherSettings"
  modified_time: "Sat Jan 24 09:16:02 2026"
  rime_version: 1.13.1
patch:
  schema_list:
    - { schema: rime_ice }
  # "switches/@0/reset": 1
  ascii_composer:
    good_old_caps_lock: true  # 上屏时，可以转换为小写等
    start_in_ascii_mode: true
    # 输入时按键的行为，noop 表示误操作，clear 表示清空，commit_code 表示上屏编码同时切换为英文，commit_text 表示上屏输入的文字
    switch_key:
      # Caps_Lock: commit_code
      # Control+space: commit_code
      Shift_L: noop
      Shift_R: noop

  # 按键绑定
  key_binder:
    bindings:
      - { when: composing, accept: Control+n, send: Down }
      - { when: composing, accept: Control+p, send: Up }
      - { when: composing, accept: Control+f, send: Right }
      - { when: composing, accept: Control+b, send: Left }
```

按键绑定的参数：

- `when` ：指定什么时候执行的快捷键
  - `composing` ：输入时
  - `always` ：任何情况下
  - `has_menu` ：操作候选词时
  - `paging` ：翻页时
- `accept` ：代表接收的按键
- `send` ：表示发送的按键
- `toggle` ：表示切换状态，更多可以去 `default.yaml` 文件中查看
  - `ascii_mode` ：中英文切换
  - `ascii_punct` ：中英文标点
  - `simplification` ：繁体与简体转换


## 如何设置输入方案默认行为

修改默认行为，比如我想要默认为英文输入，而不是每次在新窗口，都是中文

这些配置属于输入方案的配置，需要在特定的输入方案配置中进行，比如雾凇拼音，就是 `rime_ice.schema.yaml` 文件，配置速查可以看文件内容或者顶部的速查链接

在 `switches` 中，设置 `reset: 1` ，`1` 为英文，`0` 为中文

```yaml title="rime_ice.schema.yaml"
# 开关
# reset: 默认状态。注释掉后，切换窗口时不会重置到默认状态。
# states: 方案选单显示的名称。可以注释掉，仍可以通过快捷键切换。
# abbrev: 默认的缩写取 states 的第一个字符，abbrev 可自定义一个字符
switches:
  - name: ascii_mode
    states: [中, Ａ]
    reset: 1  # 关键点，设置为 1
  - name: ascii_punct # 中英标点
    states: [¥, $]
  - name: traditionalization
    states: [简, 繁]
  - name: emoji
    states: [💀, 😄]
    reset: 1
  - name: full_shape
    states: [半角, 全角]
  - name: search_single_char # search.lua 的功能开关，辅码查词时是否单字优先
    states: [正常, 单字]
    abbrev: [词, 单]
```


