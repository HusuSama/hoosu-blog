export const postsData = {"/blog/":[{"path":"/blog/q37rgo16/","title":"go-zero 踩坑","categoryList":[{"id":"21cc28","sort":10000,"name":"golang"}],"tags":["golang"],"createTime":"2025/10/12 11:53:07","lang":"zh-CN","excerpt":""}]}

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
