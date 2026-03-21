<template><div><h2 id="查找配置" tabindex="-1"><a class="header-anchor" href="#查找配置"><span>查找配置</span></a></h2>
<p>大部分配置都可以直接在文件中查看，比如 <code v-pre>default.yaml</code>、<code v-pre>weasel.yaml</code> 等</p>
<h2 id="小狼毫配置速览" tabindex="-1"><a class="header-anchor" href="#小狼毫配置速览"><span>小狼毫配置速览</span></a></h2>
<p><a href="https://github.com/rime/weasel/wiki/weasel.yaml-%E9%80%9F%E6%9F%A5" target="_blank" rel="noopener noreferrer">weasel.yaml</a></p>
<p><a href="https://github.com/LEOYoon-Tsaw/Rime_collections/blob/master/Rime_description.md" target="_blank" rel="noopener noreferrer">schema.yaml/dict.yaml</a></p>
<h2 id="安装和使用雾凇拼音" tabindex="-1"><a class="header-anchor" href="#安装和使用雾凇拼音"><span>安装和使用雾凇拼音</span></a></h2>
<p>这里不再编写有关程序安装的事项，而是说明一下注意的事项</p>
<ul>
<li>安装雾凇拼音时，最好是进行手动安装或者 <code v-pre>git</code> 下载安装，而不要使用 <code v-pre>rime</code> 的安装程序进行</li>
<li>安装 <code v-pre>rime</code> 的时候可以选择配置存放位置，最好是配置一下</li>
<li>下载好的雾凇拼音配置，直接放到配置目录下，然后重新部署一下即可</li>
</ul>
<h2 id="简单的皮肤创建" tabindex="-1"><a class="header-anchor" href="#简单的皮肤创建"><span>简单的皮肤创建</span></a></h2>
<p>针对 <code v-pre>Windows</code> 的小狼毫，可以在<a href="https://owlzou.github.io/weasel-theme-editor/" target="_blank" rel="noopener noreferrer">这里</a>尝试进行简单的自定义操作</p>
<h2 id="配置文件" tabindex="-1"><a class="header-anchor" href="#配置文件"><span>配置文件</span></a></h2>
<p>在你的配置路径下，可以找到一些配置的文件，主要需要关注下面的几个文件</p>
<ul>
<li><code v-pre>default.custom.yaml</code> ：可以进行一些基础的配置，比如快捷键等</li>
<li><code v-pre>&lt;你的拼音&gt;.schema.yaml</code> ：针对当前输入的配置，某些可以必须在这里进行，比如配置输入法默认等关于这个输入方案的配置</li>
<li><code v-pre>weasel.custom.yaml</code> ：可以对你的输入法进行一些定制操作，在其他系统上，文件是 <code v-pre>squirrel</code> 之类的，一般用于记性输入法样式等定制</li>
</ul>
<h2 id="weasel-custom-yaml-文件配置" tabindex="-1"><a class="header-anchor" href="#weasel-custom-yaml-文件配置"><span><code v-pre>weasel.custom.yaml</code> 文件配置</span></a></h2>
<div class="code-block-title" data-title="weasel.custom.yaml"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-light-yaml"/>weasel.custom.yaml</span></div><div class="language-toml line-numbers-mode" data-highlighter="shiki" data-ext="toml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-toml"><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">customization:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  distribution_code_name: Weasel</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  distribution_version: 0.17.4</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  generator: "Weasel::UIStyleSettings"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  modified_time: "Sat Jan 24 09:16:09 2026"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  rime_version: 1.13.1</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">patch:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  show_notifications_time: 200  </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 中英文切换时提示显示的时间</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">  # "style/color_scheme": lost_temple</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  app_options:    </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 关于特定程序的配置</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    Zed.exe:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      acsii_mode: true  </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 默认进入是英文状态</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      vim_mode: true  </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 开启 vim 模式，在按 `esc` 后，会自动切换到英文模式</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    neovide.exe:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      ascii_mode: true</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      vim_mode: true</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">  # 这里是一些输入法样式设置</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  style:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    color_scheme: cappuccin_macchiato_mauve</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    font_face: Maple Mono NL NF CN</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    font_point: 12</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    horizontal: true</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    inline_preedit: true</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    preedit_type: composition</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    display_tray_icon: false</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    label_format: "%s."</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    layout:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      min_width: 100</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      min_height: 8</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      border_width: 1</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      margin_x: 11</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      margin_y: 9</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      spacing: 10</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      candidate_spacing: 10</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      hilite_spacing: 5</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      hilite_padding_x: 6</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      hilite_padding_y: 6</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      round_corner: 6</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      shadow_offset_x: 1</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      shadow_offset_y: 1</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      shadow_radius: 5</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  preset_color_schemes/cappuccin_macchiato_mauve:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    name: My Theme</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    author: "-"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    border_color: "0xeaeaea"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    hilited_comment_text_color: "0xffffff"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    hilited_candidate_text_color: "0xffffff"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    hilited_candidate_back_color: "0xe37200"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    shadow_color: "0xc1c1c1"</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><h2 id="配置快捷键和按键行为" tabindex="-1"><a class="header-anchor" href="#配置快捷键和按键行为"><span>配置快捷键和按键行为</span></a></h2>
<p>配置这个需要在 <code v-pre>default.custom.yaml</code> 文件中进行</p>
<div class="code-block-title" data-title="default.custom.yaml"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-light-yaml"/>default.custom.yaml</span></div><div class="language-toml line-numbers-mode" data-highlighter="shiki" data-ext="toml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-toml"><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">customization:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  distribution_code_name: Weasel</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  distribution_version: 0.17.4</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  generator: "Rime::SwitcherSettings"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  modified_time: "Sat Jan 24 09:16:02 2026"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  rime_version: 1.13.1</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">patch:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  schema_list:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    - { schema: rime_ice }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">  # "switches/@0/reset": 1</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  ascii_composer:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    good_old_caps_lock: true  </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 上屏时，可以转换为小写等</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    start_in_ascii_mode: true</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">    # 输入时按键的行为，noop 表示误操作，clear 表示清空，commit_code 表示上屏编码同时切换为英文，commit_text 表示上屏输入的文字</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    switch_key:</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">      # Caps_Lock: commit_code</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">      # Control+space: commit_code</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      Shift_L: noop</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      Shift_R: noop</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">  # 按键绑定</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  key_binder:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    bindings:</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      - { when: composing, accept: Control+n, send: Down }</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      - { when: composing, accept: Control+p, send: Up }</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      - { when: composing, accept: Control+f, send: Right }</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">      - { when: composing, accept: Control+b, send: Left }</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>按键绑定的参数：</p>
<ul>
<li><code v-pre>when</code> ：指定什么时候执行的快捷键
<ul>
<li><code v-pre>composing</code> ：输入时</li>
<li><code v-pre>always</code> ：任何情况下</li>
<li><code v-pre>has_menu</code> ：操作候选词时</li>
<li><code v-pre>paging</code> ：翻页时</li>
</ul>
</li>
<li><code v-pre>accept</code> ：代表接收的按键</li>
<li><code v-pre>send</code> ：表示发送的按键</li>
<li><code v-pre>toggle</code> ：表示切换状态，更多可以去 <code v-pre>default.yaml</code> 文件中查看
<ul>
<li><code v-pre>ascii_mode</code> ：中英文切换</li>
<li><code v-pre>ascii_punct</code> ：中英文标点</li>
<li><code v-pre>simplification</code> ：繁体与简体转换</li>
</ul>
</li>
</ul>
<h2 id="如何设置输入方案默认行为" tabindex="-1"><a class="header-anchor" href="#如何设置输入方案默认行为"><span>如何设置输入方案默认行为</span></a></h2>
<p>修改默认行为，比如我想要默认为英文输入，而不是每次在新窗口，都是中文</p>
<p>这些配置属于输入方案的配置，需要在特定的输入方案配置中进行，比如雾凇拼音，就是 <code v-pre>rime_ice.schema.yaml</code> 文件，配置速查可以看文件内容或者顶部的速查链接</p>
<p>在 <code v-pre>switches</code> 中，设置 <code v-pre>reset: 1</code> ，<code v-pre>1</code> 为英文，<code v-pre>0</code> 为中文</p>
<div class="code-block-title" data-title="rime_ice.schema.yaml"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-light-yaml"/>rime_ice.schema.yaml</span></div><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 开关</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># reset: 默认状态。注释掉后，切换窗口时不会重置到默认状态。</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># states: 方案选单显示的名称。可以注释掉，仍可以通过快捷键切换。</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># abbrev: 默认的缩写取 states 的第一个字符，abbrev 可自定义一个字符</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">switches</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ascii_mode</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    states</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">中</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> Ａ</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    reset</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 1</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">  # 关键点，设置为 1</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> ascii_punct</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"> # 中英标点</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    states</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">¥</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> $</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> traditionalization</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    states</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">简</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 繁</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> emoji</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    states</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">💀</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 😄</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    reset</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 1</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> full_shape</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    states</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">半角</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 全角</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  -</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE"> name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> search_single_char</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"> # search.lua 的功能开关，辅码查词时是否单字优先</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    states</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">正常</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 单字</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">    abbrev</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> [</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">词</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> 单</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div></div></template>


