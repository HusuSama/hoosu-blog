export const redirects = JSON.parse("{\"/demo/bar.html\":\"/demo/5guwupr0/\",\"/demo/foo.html\":\"/demo/hbuk9v20/\",\"/blog/golang/go-zero.html\":\"/blog/q37rgo16/\",\"/blog/rime/weasel_config.html\":\"/blog/9j7q1vvk/\",\"/blog/rust/use_record.html\":\"/blog/j5pnmu6v/\",\"/blog/rust/workspace.html\":\"/blog/bbet581k/\",\"/blog/git/release-please.html\":\"/blog/cfm4wzu5/\"}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/demo/", { loader: () => import(/* webpackChunkName: "demo_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/demo/index.html.js"), meta: {"title":"Demo"} }],
  ["/demo/5guwupr0/", { loader: () => import(/* webpackChunkName: "demo_5guwupr0_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/demo/5guwupr0/index.html.js"), meta: {"title":"bar"} }],
  ["/demo/hbuk9v20/", { loader: () => import(/* webpackChunkName: "demo_hbuk9v20_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/demo/hbuk9v20/index.html.js"), meta: {"title":"foo"} }],
  ["/blog/q37rgo16/", { loader: () => import(/* webpackChunkName: "blog_q37rgo16_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/q37rgo16/index.html.js"), meta: {"title":"go-zero 踩坑"} }],
  ["/blog/9j7q1vvk/", { loader: () => import(/* webpackChunkName: "blog_9j7q1vvk_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/9j7q1vvk/index.html.js"), meta: {"title":"小狼毫输入法配置"} }],
  ["/blog/j5pnmu6v/", { loader: () => import(/* webpackChunkName: "blog_j5pnmu6v_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/j5pnmu6v/index.html.js"), meta: {"title":"Rust使用记录"} }],
  ["/blog/bbet581k/", { loader: () => import(/* webpackChunkName: "blog_bbet581k_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/bbet581k/index.html.js"), meta: {"title":"Workspace配置与使用"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
  ["/blog/", { loader: () => import(/* webpackChunkName: "blog_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/index.html.js"), meta: {"title":"Blog"} }],
  ["/blog/tags/", { loader: () => import(/* webpackChunkName: "blog_tags_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/tags/index.html.js"), meta: {"title":"标签"} }],
  ["/blog/archives/", { loader: () => import(/* webpackChunkName: "blog_archives_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/archives/index.html.js"), meta: {"title":"归档"} }],
  ["/blog/categories/", { loader: () => import(/* webpackChunkName: "blog_categories_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/categories/index.html.js"), meta: {"title":"分类"} }],
  ["/blog/cfm4wzu5/", { loader: () => import(/* webpackChunkName: "blog_cfm4wzu5_index.html" */"/Users/bytedance/docs/my-blog/docs/.vuepress/.temp/pages/blog/cfm4wzu5/index.html.js"), meta: {"title":"release-please 自动化发布"} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateRoutes) {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
  }
  if (__VUE_HMR_RUNTIME__.updateRedirects) {
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ routes, redirects }) => {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  })
}
