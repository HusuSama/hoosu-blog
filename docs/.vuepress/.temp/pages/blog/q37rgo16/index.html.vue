<template><div><h2 id="项目基础结构" tabindex="-1"><a class="header-anchor" href="#项目基础结构"><span>项目基础结构</span></a></h2>
<div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>项目结构未使用微服务架构，以目前个人的项目来</p>
</div>
<div class="vp-file-tree"><FileTreeNode expanded type="folder" filename="api" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-api" /></template><template #comment>// 存放 api 文件</template><FileTreeNode type="file" filename="user.api" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-file" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="const" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><template #comment>// 一些常量</template><FileTreeNode expanded type="folder" filename="ec" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><template #comment>// 存放错误枚举</template><FileTreeNode type="file" filename="common.go" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="user.go" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="docs" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-docs" /></template><template #comment>// 文档内容</template><FileTreeNode type="file" filename="main.json" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-json" /></template><template #comment>// goctl 生成的swagger数据</template>
</FileTreeNode>
<FileTreeNode type="file" filename="swagger.html" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-html" /></template><template #comment>// 自定义随项目启动的文件</template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="etc" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><template #comment>// 由 goctl 生成，为配置文件</template><FileTreeNode type="file" filename="main.yaml" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-light-yaml" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="http" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><template #comment>// 相关 http 后缀文件， 用于接口请求测试</template><FileTreeNode type="file" filename="login.http" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-file" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="internal" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><template #comment>// goctl 生成，包含各类逻辑等文件</template><FileTreeNode expanded type="folder" filename="config" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-config" /></template><FileTreeNode type="file" filename="config.go" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="handler" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode expanded type="folder" filename="user" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="getuserinfohandler.go" :level="3">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="userloginhandler.go" :level="3">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode type="file" filename="routes.go" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="logic" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode expanded type="folder" filename="user" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="getuserinfologic.go" :level="3">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="userloginlogic.go" :level="3">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="svc" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="servicecontext.go" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="types" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-typings" /></template><FileTreeNode type="file" filename="types.go" :level="2">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="model" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-model" /></template><template #comment>//数据库文件</template><FileTreeNode type="file" filename="user.go" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="templates" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-template" /></template><template #comment>// 存放自定义的 goctl 模板文件</template><FileTreeNode expanded type="folder" filename="api" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-api" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="docker" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="geteway" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="kube" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="model" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-model" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="mongo" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="newapi" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="rpc" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-folder" /></template><FileTreeNode type="file" filename="..." :level="2">

</FileTreeNode>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode expanded type="folder" filename="utils" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:folder-type-tools" /></template><template #comment>// 自定义功能</template><FileTreeNode type="file" filename="init_db.go" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="jwt.go" :level="1">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode>
</FileTreeNode>
<FileTreeNode type="file" filename="Dockerfile" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-docker" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="README.md" :level="0">
<template #icon><VPIcon provider="iconify" name="flat-color-icons:info" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="go.mod" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-file" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="go.sum" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:default-file" /></template>
</FileTreeNode>
<FileTreeNode type="file" filename="main.go" :level="0">
<template #icon><VPIcon provider="iconify" name="vscode-icons:file-type-go" /></template>
</FileTreeNode></div>
<h2 id="生成api代码" tabindex="-1"><a class="header-anchor" href="#生成api代码"><span>生成api代码</span></a></h2>
<h3 id="api-文件基本使用" tabindex="-1"><a class="header-anchor" href="#api-文件基本使用"><span>api 文件基本使用</span></a></h3>
<div class="hint-container important">
<p class="hint-container-title">重要</p>
<p>使用 <code v-pre>goctl api go </code> 来生成代码，会跳过已经生成的文件，所以如果新增接口、类型，需要删除无需手动编辑的文件，如 <code v-pre>types</code> 目录、主文件（路由注册）等，这个代表生成的类型等，即需要重新生成的删除，不需要的保留</p>
<p>比如一个 <code v-pre>user</code> 服务，你修改了某个接口的类型和接口定义，你需要删除 <code v-pre>handler</code> 、<code v-pre>types</code> ，然后重新执行 <code v-pre>goctl api go</code> 的命令，<code v-pre>logic</code> 逻辑代码已经改过，不要删除，精准情况下，只删除对应的文件也行</p>
</div>
<div class="hint-container important">
<p class="hint-container-title">重要</p>
<p><code v-pre>api</code> 文件中，只能有对应名称的 <code v-pre>service</code> ，创建多个 <code v-pre>service</code> 必须是同名的，即使使用 <code v-pre>import</code> 导入其他 <code v-pre>api</code> 文件也不行</p>
</div>
<div class="hint-container important">
<p class="hint-container-title">重要</p>
<p>在 <code v-pre>api</code> 文件中，可以在 <code v-pre>@server</code> 中指定 <code v-pre>group</code> 参数，生成的 <code v-pre>logic</code> 和 <code v-pre>handler</code> 可以使用不同的文件夹存在，可以进行不同分类</p>
</div>
<p>在你的项目目标文件夹中，创建一个 <code v-pre>api</code> 文件，也可以使用 <code v-pre>goctl api template -o {{目标文件夹}}\{{文件名}}.api</code> 来生成一个 <code v-pre>api</code> 文件</p>
<p>官方示例：</p>
<div class="code-block-title" data-title="api文件"><div class="code-block-title-bar"><span class="title">api文件</span></div><div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-text"><span class="line"><span>syntax = "v1"</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 这里的主要用在 swagger 文件显示</span></span>
<span class="line"><span>info (</span></span>
<span class="line"><span>    title:   "api 文件完整示例写法"</span></span>
<span class="line"><span>    desc:    "演示如何编写 api 文件"</span></span>
<span class="line"><span>    author:  "keson.an"</span></span>
<span class="line"><span>    date:    "2022 年 12 月 26 日"</span></span>
<span class="line"><span>    version: "v1"</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 type 定义请求结构体</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type UpdateReq {</span></span>
<span class="line"><span>    Arg1 string `json:"arg1"`</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type ListItem {</span></span>
<span class="line"><span>    Value1 string `json:"value1"`</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 可以使用 example 在生成 swagger 时给出一些数据的示例</span></span>
<span class="line"><span>type LoginReq {</span></span>
<span class="line"><span>    Username string `json:"username,example=username"`</span></span>
<span class="line"><span>    Password string `json:"password,example=123456"`</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 如果需要字段可选，就需要加上 optional 标记</span></span>
<span class="line"><span>type LoginResp {</span></span>
<span class="line"><span>    Name string `json:"name,optional"`</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type FormExampleReq {</span></span>
<span class="line"><span>    Name string `form:"name"`</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type PathExampleReq {</span></span>
<span class="line"><span>    // path 标签修饰的 id 必须与请求路由中的片段对应，如</span></span>
<span class="line"><span>    // id 在 service 语法块的请求路径上一定会有 :id 对应，见下文。</span></span>
<span class="line"><span>    ID string `path:"id"`</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type PathExampleResp {</span></span>
<span class="line"><span>    Name string `json:"name"`</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 这里定义的 @server 针对下面的 service ，如果有其他的，就在其他 service 上面定义 @server</span></span>
<span class="line"><span>@server (</span></span>
<span class="line"><span>    jwt:        Auth // 对当前 Foo 语法块下的所有路由，开启 jwt 认证，不需要则请删除此行</span></span>
<span class="line"><span>    prefix:     /v1 // 对当前 Foo 语法块下的所有路由，新增 /v1 路由前缀，不需要则请删除此行</span></span>
<span class="line"><span>    group:      g1 // 对当前 Foo 语法块下的所有路由，路由归并到 g1 目录下，不需要则请删除此行</span></span>
<span class="line"><span>    timeout:    3s // 对当前 Foo 语法块下的所有路由进行超时配置，不需要则请删除此行</span></span>
<span class="line"><span>    middleware: AuthInterceptor // 对当前 Foo 语法块下的所有路由添加中间件，不需要则请删除此行</span></span>
<span class="line"><span>    maxBytes:   1048576 // 对当前 Foo 语法块下的所有路由添加请求体大小控制，单位为 byte,goctl 版本 >= 1.5.0 才支持</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 这里是定义的接口</span></span>
<span class="line"><span>service Foo {</span></span>
<span class="line"><span>    // 定义没有请求体和响应体的接口，如 ping</span></span>
<span class="line"><span>    @handler ping</span></span>
<span class="line"><span>    get /ping</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 定义只有请求体的接口，如更新信息</span></span>
<span class="line"><span>    @handler update</span></span>
<span class="line"><span>    post /update (UpdateReq)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 定义只有响应体的结构，如获取全部信息列表</span></span>
<span class="line"><span>    @handler list</span></span>
<span class="line"><span>    get /list returns ([]ListItem)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 定义有结构体和响应体的接口，如登录</span></span>
<span class="line"><span>    @handler login</span></span>
<span class="line"><span>    post /login (LoginReq) returns (LoginResp)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 定义表单请求</span></span>
<span class="line"><span>    @handler formExample</span></span>
<span class="line"><span>    post /form/example (FormExampleReq)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 定义 path 参数</span></span>
<span class="line"><span>    @handler pathExample</span></span>
<span class="line"><span>    get /path/example/:id (PathExampleReq) returns (PathExampleResp)</span></span>
<span class="line"><span>}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><h3 id="生成代码" tabindex="-1"><a class="header-anchor" href="#生成代码"><span>生成代码</span></a></h3>
<ul>
<li>创建对应的<code v-pre>api</code>文件</li>
<li>使用 <code v-pre>goctl api go --api {{api文件路径}} --dir {{生成文件目录}}</code></li>
</ul>
<h2 id="响应模板定义" tabindex="-1"><a class="header-anchor" href="#响应模板定义"><span>响应模板定义</span></a></h2>
<p>使用 <code v-pre>goctl</code> 创建代码时，一般会使用对应的模板文件，默认是用户目录的 <code v-pre>.goctl</code> 目录中，从对应版本的文件夹进去，如果没有使用 <code v-pre>goctl template init</code> 来生成模板</p>
<p>在创建响应的时候，我们一般是使用固定的返回格式，比如：</p>
<div class="code-block-title" data-title="响应示例.json"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-json"/>响应示例.json</span></div><div class="language-json line-numbers-mode" data-highlighter="shiki" data-ext="json" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-json"><span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">code</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#EF9F76"> 0</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">data</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {},</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">  "</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">msg</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "成功"</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><p>如果我们直接使用 <code v-pre>api</code> 文件定义，需要每次都编写 <code v-pre>code</code> 和 <code v-pre>msg</code> 这个固定类型，我们可以使用官方扩展的 <code v-pre>x</code> 包，也可以自定义一下响应，这里使用官方的 <code v-pre>x</code> 包，你需要使用 <code v-pre>go get github.com/zeromicro/x</code> 安装</p>
<p>接下来，我们还有问题，这个配置文件在我们自己的用户目录，如果别人拿到项目，没有这个文件就不行，生成出来会不一样，所以我们还需要放在项目中，更好使用</p>
<p>以下是整个操作的具体步骤：</p>
<ul>
<li>使用 <code v-pre>goctl template init</code> 初始化模板文件，文件生成到 <code v-pre>~/.goctl/{version}</code> 下面</li>
<li>在项目中创建一个 <code v-pre>templates</code> 文件夹，名字可自定义</li>
<li>将生成的所有模板文件，放到项目的 <code v-pre>templates</code> 文件夹下</li>
<li>修改 <code v-pre>handle.tpl</code> 文件，这是用于生成 <code v-pre>handle</code> 代码的模板</li>
<li>修改内容如下：</li>
</ul>
<div class="code-block-title" data-title="模板内容.go"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-go"/>模板内容.go</span></div><div class="language-go line-numbers-mode" data-highlighter="shiki" data-ext="go" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-go"><span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">package</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> {{.PkgName}}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">import</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> (</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">	"net/http"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">	xhttp </span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"github.com/zeromicro/x/http"</span></span>
<span class="line"><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">	"github.com/zeromicro/go-zero/rest/httpx"</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">	{{.ImportPackages}}</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">{{if .HasDoc}}{{.Doc}}{{end}}</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">func</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic"> {{.HandlerName}}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EA999C;--shiki-dark-font-style:italic">svcCtx</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE"> *</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">svc</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">ServiceContext</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> http</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">HandlerFunc</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">	return</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> func</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EA999C;--shiki-dark-font-style:italic">w</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic"> http</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">ResponseWriter</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EA999C;--shiki-dark-font-style:italic"> r</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE"> *</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">http</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#DF8E1D;--shiki-light-font-style:italic;--shiki-dark:#E5C890;--shiki-dark-font-style:italic">Request</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">		{{if .HasRequest}}var req types</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">{{.RequestType}}</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">		if</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> err </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> httpx</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">Parse</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE"> &#x26;</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">req</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">);</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> err </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">!=</span><span style="--shiki-light:#D20F39;--shiki-dark:#E78284"> nil</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">			xhttp</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">JsonBaseResponseCtx</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">Context</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(),</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> w</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> err</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">			return</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">		}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">		{{end}}l </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> {{.LogicName}}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">New{{.LogicType}}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">Context</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(),</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> svcCtx</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">		{{if .HasResp}}resp</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> {{end}}err </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> l</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">{{.Call}}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">{{if .HasRequest}}</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">&#x26;</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">req{{end}}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span></span>
<span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">		if</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> err </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">!=</span><span style="--shiki-light:#D20F39;--shiki-dark:#E78284"> nil</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">			xhttp</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">JsonBaseResponseCtx</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">Context</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(),</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> w</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> err</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">		}</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6"> else</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB"> {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">			{{if .HasResp}}xhttp</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">JsonBaseResponseCtx</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">r</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">Context</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(),</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> w</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> resp</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">{{else}}httpx</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">Ok</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">w</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">{{end}}</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">		}</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">	}</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><ul>
<li>使用 <code v-pre>api</code> 文件生成代码，使用 <code v-pre>--home</code> 参数指定使用项目 <code v-pre>templates</code> 文件夹下的模板：</li>
</ul>
<div class="language-powershell line-numbers-mode" data-highlighter="shiki" data-ext="powershell" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-powershell"><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">goctl api go </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">--</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">api {{api文件路径}} </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">--</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">dir {{生成的文件夹路径}} </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">--</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">home .\templates</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="swagger-文档" tabindex="-1"><a class="header-anchor" href="#swagger-文档"><span>Swagger 文档</span></a></h2>
<p><code v-pre>api</code> 文件配置可参照官方：https://go-zero.dev/docs/tutorials/cli/swagger</p>
<h3 id="集成到服务中" tabindex="-1"><a class="header-anchor" href="#集成到服务中"><span>集成到服务中</span></a></h3>
<ul>
<li>在项目中创建一个目录 <code v-pre>doc</code> 或者 <code v-pre>static</code> 都行</li>
<li>使用 <code v-pre>goctl api swagger --api {{api文件路径}} --dir ./doc</code> 生成文件到指定的目录</li>
<li>在新建的目录创建 <code v-pre>swagger.html</code> 文件，<code v-pre>json</code> 文件和 <code v-pre>html</code> 文件同一个目录，不同需要指定好路径，在 <code v-pre>html</code> 添加如下代码：</li>
</ul>
<div class="code-block-title" data-title="swagger.html"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-html"/>swagger.html</span></div><div class="language-html line-numbers-mode" data-highlighter="shiki" data-ext="html" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-html"><span class="line"><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">&#x3C;!DOCTYPE</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#E5C890"> html</span><span style="--shiki-light:#8839EF;--shiki-dark:#CA9EE6">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">html</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">head</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">title</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">Swagger UI</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">title</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">link</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#E5C890"> rel</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"stylesheet"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#E5C890"> href</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE"> /></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">  &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">head</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">body</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">div</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#E5C890"> id</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"swagger-ui"</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">>&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">div</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">script</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#E5C890"> src</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">&#x3C;</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">script</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">script</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">      SwaggerUIBundle</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">{</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">        url</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> "./main.json"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#949CBB;--shiki-dark-font-style:italic"> // 确保路径正确</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">        dom_id</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189"> '#swagger-ui'</span></span>
<span class="line"><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">      }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">    &#x3C;</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">script</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">  &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">body</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span>
<span class="line"><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#8CAAEE">html</span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><ul>
<li>进入主启动文件，获取当前的路径</li>
</ul>
<div class="code-block-title" data-title="main.go"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-go"/>main.go</span></div><div class="language-go line-numbers-mode" data-highlighter="shiki" data-ext="go" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-go"><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">fs </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> http</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">Dir</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"./doc"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">)</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></div><ul>
<li>在定义 <code v-pre>server</code> 的代码中，加入静态文件服务</li>
</ul>
<div class="code-block-title" data-title="main.go"><div class="code-block-title-bar"><span class="title"><VPIcon provider="iconify" name="vscode-icons:file-type-go"/>main.go</span></div><div class="language-go line-numbers-mode" data-highlighter="shiki" data-ext="go" style="--shiki-light:#4c4f69;--shiki-dark:#c6d0f5;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#303446"><pre class="shiki shiki-themes catppuccin-latte catppuccin-frappe vp-code" v-pre=""><code class="language-go"><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">server </span><span style="--shiki-light:#179299;--shiki-dark:#81C8BE">:=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> rest</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">MustNewServer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">c</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5">RestConf</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> rest</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#8CAAEE;--shiki-dark-font-style:italic">WithFileServer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6D189">"/static/"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#C6D0F5"> fs</span><span style="--shiki-light:#7C7F93;--shiki-dark:#949CBB">))</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></div><ul>
<li>启动服务，查看地址：<code v-pre>http://127.0.0.1:8888/doc/swagger.html</code></li>
</ul>
</div></template>


