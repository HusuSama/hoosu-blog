export const redirects = JSON.parse("{\"/demo/bar.html\":\"/demo/5guwupr0/\",\"/demo/foo.html\":\"/demo/hbuk9v20/\",\"/blog/golang/go-zero.html\":\"/blog/q37rgo16/\"}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/demo/5guwupr0/", { loader: () => import(/* webpackChunkName: "demo_5guwupr0_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/demo/5guwupr0/index.html.js"), meta: {"title":"bar"} }],
  ["/demo/hbuk9v20/", { loader: () => import(/* webpackChunkName: "demo_hbuk9v20_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/demo/hbuk9v20/index.html.js"), meta: {"title":"foo"} }],
  ["/demo/", { loader: () => import(/* webpackChunkName: "demo_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/demo/index.html.js"), meta: {"title":"Demo"} }],
  ["/blog/q37rgo16/", { loader: () => import(/* webpackChunkName: "blog_q37rgo16_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/blog/q37rgo16/index.html.js"), meta: {"title":"go-zero 踩坑"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
  ["/blog/", { loader: () => import(/* webpackChunkName: "blog_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/blog/index.html.js"), meta: {"title":"Blog"} }],
  ["/blog/tags/", { loader: () => import(/* webpackChunkName: "blog_tags_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/blog/tags/index.html.js"), meta: {"title":"标签"} }],
  ["/blog/archives/", { loader: () => import(/* webpackChunkName: "blog_archives_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/blog/archives/index.html.js"), meta: {"title":"归档"} }],
  ["/blog/categories/", { loader: () => import(/* webpackChunkName: "blog_categories_index.html" */"D:/vpress-docs/blog/docs/.vuepress/.temp/pages/blog/categories/index.html.js"), meta: {"title":"分类"} }],
]);
