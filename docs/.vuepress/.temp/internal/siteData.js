export const siteData = JSON.parse("{\"base\":\"/hoosu-blog/\",\"lang\":\"zh-CN\",\"title\":\"知识库\",\"description\":\"个人使用的知识库\",\"head\":[[\"link\",{\"rel\":\"icon\",\"href\":\"/logo.svg\"}]],\"locales\":{}}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateSiteData) {
    __VUE_HMR_RUNTIME__.updateSiteData(siteData)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ siteData }) => {
    __VUE_HMR_RUNTIME__.updateSiteData(siteData)
  })
}
