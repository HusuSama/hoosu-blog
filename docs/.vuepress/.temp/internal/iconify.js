import './iconify.css'
export const icons = {"co":["vscode-icons","flat-color-icons","simple-icons"],"bg":{"0":["folder-type-api","default-file","default-folder","file-type-go","folder-type-docs","file-type-json","file-type-html","file-type-light-yaml","folder-type-config","folder-type-typings","folder-type-model","folder-type-template","folder-type-tools","file-type-docker","file-type-shell"],"1":["info"]},"mask":{"2":["github"]}}

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateIcons) {
    __VUE_HMR_RUNTIME__.updateIcons(icons)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ icons }) => {
    __VUE_HMR_RUNTIME__.updateIcons(icons)
  })
}
