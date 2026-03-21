<template><div><div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>文档作为使用 <code v-pre>rust</code> 进行开发时的问题记录，并非完整的教学，比较碎片化</p>
</div>
<h2 id="基础使用中的注意事项" tabindex="-1"><a class="header-anchor" href="#基础使用中的注意事项"><span>基础使用中的注意事项</span></a></h2>
<h3 id="单引号和双引号的区别" tabindex="-1"><a class="header-anchor" href="#单引号和双引号的区别"><span>单引号和双引号的区别</span></a></h3>
<p>在创建字符串（字符串切片）时，使用单引号表示的是 <code v-pre>Char</code> ，当某些需要投递 <code v-pre>Char</code> 数据时，必须使用单引号的形式，而且只能输入一个字符，比如 <code v-pre>'q'</code> ，表示 <code v-pre>Char</code> 字符 <code v-pre>q</code></p>
<h2 id="doc-注释" tabindex="-1"><a class="header-anchor" href="#doc-注释"><span>DOC 注释</span></a></h2>
<h3 id="编写注释" tabindex="-1"><a class="header-anchor" href="#编写注释"><span>编写注释</span></a></h3>
<ul>
<li>所有文件都为一个模块，文件顶部使用 <code v-pre>//!</code> 进行注释，作为模块的主要说明</li>
<li>公开的结构体、字段、函数等，使用 <code v-pre>///</code> 进行注释</li>
<li>在注释中，可以添加示例代码，示例代码在使用 <code v-pre>cargo test</code> 时会自动执行，如果不想执行，则需要指定 <code v-pre>no_run</code> 、<code v-pre>ignore</code> 等
<ul>
<li>注释中使用 <code v-pre># Example</code> 作为标记，写入代码块则默认在 <code v-pre>cargo test</code> 时执行</li>
<li>代码块标识后加 <code v-pre>no_run</code> 时，表示不运行，但是会编译，查看示例代码是否有效</li>
<li>使用 <code v-pre>ignore</code> 时，代码不会执行也不会编译，主要用于不能执行的示例说明</li>
</ul>
</li>
</ul>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-"><span class="line"><span></span></span>
<span class="line"><span>//! # Example</span></span>
<span class="line"><span>//!</span></span>
<span class="line"><span>//! ```</span></span>
<span class="line"><span>//! &#x3C;code> 未标记代码类型，默认为 rust</span></span>
<span class="line"><span>//! ```</span></span>
<span class="line"><span>//!</span></span>
<span class="line"><span>//! ```no_run</span></span>
<span class="line"><span>//! </span></span>
<span class="line"><span>//! ```</span></span>
<span class="line"><span>//! </span></span>
<span class="line"><span>//! ```ignore</span></span>
<span class="line"><span>//! </span></span>
<span class="line"><span>//! ```</span></span>
<span class="line"><span>//!</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li><code v-pre>doc</code> 注释不能写在 <code v-pre>impl</code> 上，需要放在具体的对象上，比如放在结构体，<code v-pre>impl</code> 应该只聚焦具体的方法</li>
<li>如果不是 <code v-pre>pub</code> 的字段，进行 <code v-pre>doc</code> 标注也不会显示</li>
</ul>
<h3 id="生成注释" tabindex="-1"><a class="header-anchor" href="#生成注释"><span>生成注释</span></a></h3>
<div class="code-block-title" data-title="bash.sh"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-shell"/>bash.sh</span></div><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 生成文档并打开，这种方式连带里面的依赖也会生成进来，会非常大，一般使用无依赖的形式</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">cargo</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> doc</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> --open</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"># 生成文档并打开，但是不包含依赖的三方包</span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">cargo</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> doc</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> --no-deps</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> --open</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><h2 id="option-result-相关" tabindex="-1"><a class="header-anchor" href="#option-result-相关"><span>Option/Result 相关</span></a></h2>
<h3 id="map-和-and-then" tabindex="-1"><a class="header-anchor" href="#map-和-and-then"><span>map 和 and_then</span></a></h3>
<p><code v-pre>map</code> 和 <code v-pre>and_then</code> 都是对 <code v-pre>Option</code> 执行某些操作并且返回，假如 <code v-pre>map</code> 和 <code v-pre>and_then</code> 使用的同一个函数，如果这个函数返回的是一个普通值，可以使用 <code v-pre>map</code> ，如果返回的
是另一个 <code v-pre>Option</code> 值，则使用 <code v-pre>and_then</code> ，可以扁平化嵌套的 <code v-pre>Option</code>，如果使用 <code v-pre>map</code> ，可能还需要在后面的链式操作中，使用 <code v-pre>flatten</code> 进行扁平化处理</p>
<h2 id="实现某些常用-trait" tabindex="-1"><a class="header-anchor" href="#实现某些常用-trait"><span>实现某些常用 trait</span></a></h2>
<p>实现某些 <code v-pre>trait</code> ，很多可以直接使用派生宏，如果比较复杂，则使用 <code v-pre>impl</code> 来进行手动实现，比如这里为结构体实现 <code v-pre>Default</code></p>
<div class="language-rust line-numbers-mode" data-highlighter="shiki" data-ext="rust" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-rust"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">// 直接派生</span></span>
<span class="line"><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">#</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">derive</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">Default</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)]</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">struct</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> A</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> String</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic">// 手动构造</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">impl</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> Default</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> for</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> A</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">  fn</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic"> default</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">()</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE"> -></span><span style="--shiki-light:#D20F39;--shiki-dark:#E78284"> Self</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#D20F39;--shiki-dark:#E78284">    Self</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">name</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> String</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">::</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">new</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">()}</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>比较常见的 <code v-pre>trait</code></p>
<ul>
<li><code v-pre>Clone</code> : 深拷贝，一般直接使用派生即可，如果复杂则需要手动实现</li>
<li><code v-pre>Copy</code> : 按位复制，只能用在栈上数据，不会移动数据，比如 <code v-pre>String</code>、<code v-pre>Vec</code> 等就不能用，一般基础类型等实现了 <code v-pre>Copy</code> 方法，可直接派生，复杂需手动实现，但是一般不会人工去实现 <code v-pre>Copy</code></li>
<li><code v-pre>Debug</code> : 用于使用类似 <code v-pre>{:?}</code> 或 <code v-pre>{:#?}</code> 进行调试输出，直接派生即可</li>
<li><code v-pre>Display</code> : 需要手动实现 <code v-pre>impl</code> ，去实现 <code v-pre>to_string</code> 的方法</li>
<li><code v-pre>Default</code> : 为结构体等实现 <code v-pre>default</code>，之后可以使用 <code v-pre>&lt;结构体&gt;::default()</code> 创建带默认值的实例</li>
<li><code v-pre>PartialEq, Eq</code> : 是否相等</li>
<li><code v-pre>PartialOrd, Ord</code> : 比较大小的方法</li>
<li><code v-pre>FromStr</code> : 为枚举等实现 <code v-pre>from_str</code> 的方法，当然还有 <code v-pre>From&lt;T&gt;</code> 之类的，这看名称则知道是 <code v-pre>from</code> 方法，对于枚举，如果使用的比较多，可以加入 <code v-pre>strum</code> 包，里面增加了很多针对枚举的功能，比如实现字符串枚举之类的</li>
<li><code v-pre>From&lt;T&gt;</code> : 安全的从 <code v-pre>T</code> 类型转换到当前类型，需要手动 <code v-pre>impl</code> 实现，实现可获得 <code v-pre>into()</code> 方法，所以一般也不会去实现 <code v-pre>Into&lt;T&gt;</code> 这个</li>
<li><code v-pre>Iterator</code> : 支持 <code v-pre>map</code>、循环、<code v-pre>filter</code> 等，需要手动实现 <code v-pre>next()</code> 方法</li>
</ul>
<h2 id="异步-trait-实现" tabindex="-1"><a class="header-anchor" href="#异步-trait-实现"><span>异步 trait 实现</span></a></h2>
<p>当你的 <code v-pre>trait</code> 中包含异步方法时，你需要使用 <code v-pre>async_trait</code> 来进行构造，至于为什么异步 <code v-pre>trait</code> 实现会这么麻烦，可以参照<a href="https://smallcultfollowing.com/babysteps/blog/2019/10/26/async-fn-in-traits-are-hard/" target="_blank" rel="noopener noreferrer">这个说明</a></p>
<p>使用 <code v-pre>cargo add async_trait</code> 安装后，在你的 <code v-pre>trait</code> 和 <code v-pre>impl</code> 上使用宏 <code v-pre>#[async_trait]</code></p>
<h2 id="单元测试" tabindex="-1"><a class="header-anchor" href="#单元测试"><span>单元测试</span></a></h2>
<p>单元测试一般写在当前测试的文件底部，写法如：</p>
<div class="language-rust line-numbers-mode" data-highlighter="shiki" data-ext="rust" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-rust"><span class="line"><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">#</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">cfg</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">test</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)]</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">mod</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> tests</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">  use</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> super</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">::*</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  #</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">test</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">  fn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> test_case</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果要测试异步任务，需要使用 <code v-pre>tokio::test</code></p>
<div class="language-rust line-numbers-mode" data-highlighter="shiki" data-ext="rust" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-rust"><span class="line"><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">#</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">cfg</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">test</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)]</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">mod</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> tests</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">  use</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> super</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">::*</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  #</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#E5C890">tokio</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">::</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">test</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">  async</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> fn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> test_case</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code v-pre>#[ignore]</code> 可忽略当前用例，除非指定运行，对于某些 <code v-pre>CI</code> 不想自动执行可以加上，比如测试依赖某个环境变量之类的</p>
<div class="language-rust line-numbers-mode" data-highlighter="shiki" data-ext="rust" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-rust"><span class="line"><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">#</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">cfg</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">test</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)]</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">mod</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> tests</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">  use</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> super</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">::*</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  #</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#E5C890">tokio</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">::</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">test</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">  #</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">ignore</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">  async</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> fn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> test_case</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  }</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="执行单元测试" tabindex="-1"><a class="header-anchor" href="#执行单元测试"><span>执行单元测试</span></a></h3>
<p>执行单元测试使用命令 <code v-pre>cargo test</code>，可以通过 <code v-pre>cargo help test</code> 查看更多文档</p>
<p><mark>默认 <code v-pre>cargo test</code> 不会显示 <code v-pre>Println!()</code> 之类的数据，需要执行时加上 <code v-pre>--no-capture</code> 才会显示</mark></p>
<p>手动指定的话，需要从模块开始往下找，比如</p>
<div class="code-block-title" data-title="test.sh"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-shell"/>test.sh</span></div><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">cargo</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> test</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE"> &#x3C;</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">mod</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">1></span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">::</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">&#x3C;</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">mod</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">2></span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">::</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">&#x3C;</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">mod</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">3></span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">::test_case</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></div><h3 id="测试实现-trait-的结构体方法" tabindex="-1"><a class="header-anchor" href="#测试实现-trait-的结构体方法"><span>测试实现 trait 的结构体方法</span></a></h3>
<p><mark>在 <code v-pre>impl</code> 实现某个 <code v-pre>trait</code> 时，不能使用 <code v-pre>pub</code> 前缀</mark>，是否开放根据 <code v-pre>trait</code> 的结果来，不能 <code v-pre>pub</code> 则不能直接进行单元测试（因为需要使用 <code v-pre>use super::*</code> 之类的获取上级模块函数）</p>
<ul>
<li>直接通过集成测试，在 <code v-pre>test</code> 文件夹中编写</li>
<li>先实现结构体的方法，可同名，然后再写一个 <code v-pre>impl &lt;trait&gt; for &lt;struct&gt;</code> ，里面的实现直接调用结构体已实现的方法，这样则不影响</li>
</ul>
<h2 id="关于如何查找锁定-feature" tabindex="-1"><a class="header-anchor" href="#关于如何查找锁定-feature"><span>关于如何查找锁定 Feature</span></a></h2>
<p>你可以通过下面几种方式找到 <code v-pre>feature</code></p>
<ul>
<li>在 <code v-pre>docs.rs</code> 文档的 <code v-pre>feature tag</code> 中找到所有</li>
<li>在项目源码的 <code v-pre>Cargo.toml</code> 文件中，找到 <code v-pre>[feature]</code> 标记下的</li>
</ul>
<p>怎么确定你需要使用什么 <code v-pre>feature</code> 呢？一般是在 <code v-pre>docs.rs</code> 中去看，你使用的某些函数、结构体等，后面会有黄色的小标签，提示这个属于什么 <code v-pre>feature</code> ，特殊的 <code v-pre>feature</code> 注意：</p>
<ul>
<li><code v-pre>default</code> : 这个 <code v-pre>feature</code> 是用来包含默认的，你直接使用 <code v-pre>cargo add</code> ，但是不指定 <code v-pre>-F/--feature</code> 时，会安装默认的，在 <code v-pre>docs.rs</code> 的 <code v-pre>feature tag</code> 或者 <code v-pre>Cargo.toml</code> 可以看到</li>
<li>如果不想要 <code v-pre>default</code> 的 <code v-pre>feature</code> ，完全自己控制，则通过在 <code v-pre>Cargo.toml</code> 依赖中加上 <code v-pre>default-features = false</code> 来取消安装 <code v-pre>default</code> 的依赖</li>
<li>如果查找当前的依赖，可以使用 <code v-pre>cargo tree</code> 来查看，<code v-pre>cargo tree -i tokio</code> 查看关于 <code v-pre>tokio</code> 这个使用这个包的依赖，使用 <code v-pre>cargo tree -e features -i tokio</code> 还可以显示出所有 <code v-pre>feature</code> 名称，但是很难看清楚，直接看 <code v-pre>docs.rs</code> 更好</li>
</ul>
<h2 id="如何缩小编译体积" tabindex="-1"><a class="header-anchor" href="#如何缩小编译体积"><span>如何缩小编译体积</span></a></h2>
<p>针对编译的配置，在 <code v-pre>Cargo.toml</code> 的 <code v-pre>[profile.release]</code> 下，这是使用 <code v-pre>cargo build --release</code> 的配置数据，缩小体积可以使用下面的一些</p>
<div class="language-toml line-numbers-mode" data-highlighter="shiki" data-ext="toml" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-toml"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">[</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">profile.release</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 开启后生成无调试符号的二进制，即不能再进行调试操作</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">strip </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 启用链接时优化</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 使用 true 全程序 LTO，跨 crate 优化，大幅减小体积并提升性能</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 使用 thin ，轻量级 LTO，编译更快，体积缩减略少但仍有显著效果</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 启用后编译时间会显著增加，对于某些动态链接场景可能会受影响</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">lto </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 禁用 panic unwind</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 默认panic会进行栈资源清理等，获取panic信息，使用 `abort` 则直接退出</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">panic </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "abort"</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 可以使用 `s` 或者 `z` ，优化体积，使用的 LLVM 的 `-Oz`，使用 `z` 会比 `s` 更激进，一般使用 `s` 也够了</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">opt-level </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "s"</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">// 减少并行编译单元，牺牲编译速度获取更优的跨函数优化，开启后编译会非常慢，但体积也会更小</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">codegen-units </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其他较小体积的提示：</p>
<ul>
<li>精简 <code v-pre>feature</code> ，不要使用过多冗余的，比如很多时候，使用 <code v-pre>tokio</code> 直接使用 <code v-pre>full</code></li>
<li>使用 <code v-pre>UPX</code> 进行压缩，但一般不推荐，运行时解压可能会报毒，启动多了解压更慢，没办法全平台通用，比如 <code v-pre>macOS</code> 不能用</li>
</ul>
</div></template>


