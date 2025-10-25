import comp from "D:/vpress-docs/blog/docs/.vuepress/.temp/pages/blog/ccamiltr/index.html.vue"
const data = JSON.parse("{\"path\":\"/blog/ccamiltr/\",\"title\":\"自定义组件\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"自定义组件\",\"tags\":[\"预览\",\"组件\"],\"createTime\":\"2025/10/12 11:13:21\",\"permalink\":\"/blog/ccamiltr/\"},\"readingTime\":{\"minutes\":0.2,\"words\":20},\"git\":{},\"filePathRelative\":\"blog/preview/custom-component.example.md\",\"headers\":[],\"categoryList\":[{\"id\":\"5ebeb6\",\"sort\":10000,\"name\":\"preview\"}]}")
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
