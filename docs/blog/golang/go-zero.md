---
title: go-zero 踩坑
createTime: 2025/10/12 11:53:07
permalink: /blog/q37rgo16/
tags:
  - golang
---

## 项目基础结构

:::tip
项目结构未使用微服务架构，以目前个人的项目来
:::

:::file-tree
- api // 存放 api 文件
  - user.api
- const // 一些常量
  - ec // 存放错误枚举
    - common.go
    - user.go
- docs // 文档内容
  - main.json // goctl 生成的swagger数据
  - swagger.html  // 自定义随项目启动的文件
- etc // 由 goctl 生成，为配置文件
  - main.yaml
- http // 相关 http 后缀文件， 用于接口请求测试
  - login.http
- internal // goctl 生成，包含各类逻辑等文件
  - config
    - config.go
  - handler
    - user
      - getuserinfohandler.go
      - userloginhandler.go
    - routes.go
  - logic
    - user
      - getuserinfologic.go
      - userloginlogic.go
  - svc
    - servicecontext.go
  - types
    - types.go
- model //数据库文件
  - user.go
- templates // 存放自定义的 goctl 模板文件
  - api
    - ...
  - docker
    - ...
  - geteway
    - ...
  - kube
    - ...
  - model
    - ...
  - mongo
    - ...
  - newapi
    - ...
  - rpc
    - ...
- utils // 自定义功能
  - init_db.go
  - jwt.go
- Dockerfile
- README.md
- go.mod
- go.sum
- main.go
:::

## 生成api代码

### api 文件基本使用

> [!important]
> 使用 `goctl api go ` 来生成代码，会跳过已经生成的文件，所以如果新增接口、类型，需要删除无需手动编辑的文件，如 `types` 目录、主文件（路由注册）等，这个代表生成的类型等，即需要重新生成的删除，不需要的保留
>
> 比如一个 `user` 服务，你修改了某个接口的类型和接口定义，你需要删除 `handler` 、`types` ，然后重新执行 `goctl api go` 的命令，`logic` 逻辑代码已经改过，不要删除，精准情况下，只删除对应的文件也行

> [!important]
> `api` 文件中，只能有对应名称的 `service` ，创建多个 `service` 必须是同名的，即使使用 `import` 导入其他 `api` 文件也不行

> [!important]
> 在 `api` 文件中，可以在 `@server` 中指定 `group` 参数，生成的 `logic` 和 `handler` 可以使用不同的文件夹存在，可以进行不同分类

在你的项目目标文件夹中，创建一个 `api` 文件，也可以使用 `goctl api template -o {{目标文件夹}}\{{文件名}}.api` 来生成一个 `api` 文件

官方示例：

```text title="api文件"
syntax = "v1"

// 这里的主要用在 swagger 文件显示
info (
    title:   "api 文件完整示例写法"
    desc:    "演示如何编写 api 文件"
    author:  "keson.an"
    date:    "2022 年 12 月 26 日"
    version: "v1"
)

// 使用 type 定义请求结构体

type UpdateReq {
    Arg1 string `json:"arg1"`
}

type ListItem {
    Value1 string `json:"value1"`
}

// 可以使用 example 在生成 swagger 时给出一些数据的示例
type LoginReq {
    Username string `json:"username,example=username"`
    Password string `json:"password,example=123456"`
}

// 如果需要字段可选，就需要加上 optional 标记
type LoginResp {
    Name string `json:"name,optional"`
}

type FormExampleReq {
    Name string `form:"name"`
}

type PathExampleReq {
    // path 标签修饰的 id 必须与请求路由中的片段对应，如
    // id 在 service 语法块的请求路径上一定会有 :id 对应，见下文。
    ID string `path:"id"`
}

type PathExampleResp {
    Name string `json:"name"`
}

// 这里定义的 @server 针对下面的 service ，如果有其他的，就在其他 service 上面定义 @server
@server (
    jwt:        Auth // 对当前 Foo 语法块下的所有路由，开启 jwt 认证，不需要则请删除此行
    prefix:     /v1 // 对当前 Foo 语法块下的所有路由，新增 /v1 路由前缀，不需要则请删除此行
    group:      g1 // 对当前 Foo 语法块下的所有路由，路由归并到 g1 目录下，不需要则请删除此行
    timeout:    3s // 对当前 Foo 语法块下的所有路由进行超时配置，不需要则请删除此行
    middleware: AuthInterceptor // 对当前 Foo 语法块下的所有路由添加中间件，不需要则请删除此行
    maxBytes:   1048576 // 对当前 Foo 语法块下的所有路由添加请求体大小控制，单位为 byte,goctl 版本 >= 1.5.0 才支持
)

// 这里是定义的接口
service Foo {
    // 定义没有请求体和响应体的接口，如 ping
    @handler ping
    get /ping

    // 定义只有请求体的接口，如更新信息
    @handler update
    post /update (UpdateReq)

    // 定义只有响应体的结构，如获取全部信息列表
    @handler list
    get /list returns ([]ListItem)

    // 定义有结构体和响应体的接口，如登录
    @handler login
    post /login (LoginReq) returns (LoginResp)

    // 定义表单请求
    @handler formExample
    post /form/example (FormExampleReq)

    // 定义 path 参数
    @handler pathExample
    get /path/example/:id (PathExampleReq) returns (PathExampleResp)
}

```

### 生成代码
- 创建对应的`api`文件
- 使用 `goctl api go --api {{api文件路径}} --dir {{生成文件目录}}`

## 响应模板定义

使用 `goctl` 创建代码时，一般会使用对应的模板文件，默认是用户目录的 `.goctl` 目录中，从对应版本的文件夹进去，如果没有使用 `goctl template init` 来生成模板

在创建响应的时候，我们一般是使用固定的返回格式，比如：

```json title="响应示例.json"
{
  "code": 0,
  "data": {},
  "msg": "成功"
}
```

如果我们直接使用 `api` 文件定义，需要每次都编写 `code` 和 `msg` 这个固定类型，我们可以使用官方扩展的 `x` 包，也可以自定义一下响应，这里使用官方的 `x` 包，你需要使用 `go get github.com/zeromicro/x` 安装

接下来，我们还有问题，这个配置文件在我们自己的用户目录，如果别人拿到项目，没有这个文件就不行，生成出来会不一样，所以我们还需要放在项目中，更好使用

以下是整个操作的具体步骤：

- 使用 `goctl template init` 初始化模板文件，文件生成到 `~/.goctl/{version}` 下面
- 在项目中创建一个 `templates` 文件夹，名字可自定义
- 将生成的所有模板文件，放到项目的 `templates` 文件夹下
- 修改 `handle.tpl` 文件，这是用于生成 `handle` 代码的模板
- 修改内容如下：

```go title="模板内容.go"
package {{.PkgName}}

import (
	"net/http"
	xhttp "github.com/zeromicro/x/http"
	"github.com/zeromicro/go-zero/rest/httpx"
	{{.ImportPackages}}
)

{{if .HasDoc}}{{.Doc}}{{end}}
func {{.HandlerName}}(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		{{if .HasRequest}}var req types.{{.RequestType}}
		if err := httpx.Parse(r, &req); err != nil {
			xhttp.JsonBaseResponseCtx(r.Context(), w, err)
			return
		}

		{{end}}l := {{.LogicName}}.New{{.LogicType}}(r.Context(), svcCtx)
		{{if .HasResp}}resp, {{end}}err := l.{{.Call}}({{if .HasRequest}}&req{{end}})
		if err != nil {
			xhttp.JsonBaseResponseCtx(r.Context(), w, err)
		} else {
			{{if .HasResp}}xhttp.JsonBaseResponseCtx(r.Context(), w, resp){{else}}httpx.Ok(w){{end}}
		}
	}
}
```

- 使用 `api` 文件生成代码，使用 `--home` 参数指定使用项目 `templates` 文件夹下的模板：

```powershell
goctl api go --api {{api文件路径}} --dir {{生成的文件夹路径}} --home .\templates
```

## Swagger 文档
`api` 文件配置可参照官方：https://go-zero.dev/docs/tutorials/cli/swagger

### 集成到服务中

- 在项目中创建一个目录 `doc` 或者 `static` 都行
- 使用 `goctl api swagger --api {{api文件路径}} --dir ./doc` 生成文件到指定的目录
- 在新建的目录创建 `swagger.html` 文件，`json` 文件和 `html` 文件同一个目录，不同需要指定好路径，在 `html` 添加如下代码：

```html title="swagger.html"
<!DOCTYPE html>
<html>
  <head>
    <title>Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: "./main.json", // 确保路径正确
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>
```

- 进入主启动文件，获取当前的路径

```go title="main.go"
fs := http.Dir("./doc")
```

- 在定义 `server` 的代码中，加入静态文件服务

```go title="main.go"
server := rest.MustNewServer(c.RestConf, rest.WithFileServer("/static/", fs))
```

- 启动服务，查看地址：`http://127.0.0.1:8888/doc/swagger.html`
