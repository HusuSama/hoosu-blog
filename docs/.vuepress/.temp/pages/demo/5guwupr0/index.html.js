import comp from "D:/vpress-docs/blog/docs/.vuepress/.temp/pages/demo/5guwupr0/index.html.vue"
const data = JSON.parse("{\"path\":\"/demo/5guwupr0/\",\"title\":\"bar\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"bar\",\"createTime\":\"2025/10/12 11:13:21\",\"permalink\":\"/demo/5guwupr0/\"},\"readingTime\":{\"minutes\":0.11,\"words\":11},\"git\":{},\"filePathRelative\":\"demo/bar.md\",\"headers\":[]}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
