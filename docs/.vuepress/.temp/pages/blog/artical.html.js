import comp from "D:/vpress-docs/blog/docs/.vuepress/.temp/pages/blog/artical.html.vue"
const data = JSON.parse("{\"path\":\"/blog/artical.html\",\"title\":\"测试一下\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"readingTime\":{\"minutes\":0.01,\"words\":4},\"git\":{},\"filePathRelative\":\"blog/artical.md\",\"headers\":[],\"categoryList\":[]}")
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
