import comp from "D:/vpress-docs/blog/docs/.vuepress/.temp/pages/index.html.vue"
const data = JSON.parse("{\"path\":\"/\",\"title\":\"\",\"lang\":\"zh-CN\",\"frontmatter\":{\"pageLayout\":\"home\",\"externalLinkIcon\":false,\"config\":[{\"type\":\"hero\",\"full\":true,\"background\":\"tint-plate\",\"hero\":{\"name\":\"Hoosu Blog\",\"tagline\":\"个人杂七杂八知识库\",\"text\":\"个人的知识仓库，对于各种编程知识、技巧的积累\",\"actions\":[{\"theme\":\"brand\",\"text\":\"博客\",\"link\":\"/blog/\"},{\"theme\":\"alt\",\"text\":\"Github →\",\"link\":null}]}}]},\"readingTime\":{\"minutes\":0.6,\"words\":60},\"git\":{},\"filePathRelative\":\"README.md\",\"headers\":[]}")
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
