export const postsData = {"/blog/":[{"path":"/blog/q37rgo16/","title":"go-zero 踩坑","tags":["golang"],"createTime":"2025/10/12 11:53:07","lang":"zh-CN","excerpt":""},{"path":"/blog/jj5vxala/","title":"Markdown","tags":["markdown"],"createTime":"2025/10/12 11:13:21","lang":"zh-CN","excerpt":""},{"path":"/blog/ccamiltr/","title":"自定义组件","tags":["预览","组件"],"createTime":"2025/10/12 11:13:21","lang":"zh-CN","excerpt":""}]}

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
