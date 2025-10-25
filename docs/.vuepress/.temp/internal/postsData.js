export const postsData = {"/blog/":[{"path":"/blog/q37rgo16/","title":"go-zero 踩坑","categoryList":[{"id":"21cc28","sort":10001,"name":"golang"}],"tags":["golang"],"createTime":"2025/10/12 11:53:07","lang":"zh-CN","excerpt":""},{"path":"/blog/jj5vxala/","title":"Markdown","categoryList":[{"id":"5ebeb6","sort":10000,"name":"preview"}],"tags":["markdown"],"createTime":"2025/10/12 11:13:21","lang":"zh-CN","excerpt":""},{"path":"/blog/ccamiltr/","title":"自定义组件","categoryList":[{"id":"5ebeb6","sort":10000,"name":"preview"}],"tags":["预览","组件"],"createTime":"2025/10/12 11:13:21","lang":"zh-CN","excerpt":""}]}

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePostsData) {
    __VUE_HMR_RUNTIME__.updatePostsData(postsData)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ postsData }) => {
    __VUE_HMR_RUNTIME__.updatePostsData(postsData)
  })
}
