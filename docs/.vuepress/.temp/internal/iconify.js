import './iconify.css'
export const icons = {"vscode-icons:folder-type-api":"vpi-uf7ae2v1 bg","vscode-icons:default-file":"vpi-slp57vm5 bg","vscode-icons:default-folder":"vpi-onbwgehz bg","vscode-icons:file-type-go":"vpi-cse1xrye bg","vscode-icons:folder-type-docs":"vpi-hn62aija bg","vscode-icons:file-type-json":"vpi-zrezd4j1 bg","vscode-icons:file-type-html":"vpi-pps4lv1h bg","vscode-icons:file-type-light-yaml":"vpi-goxycfas bg","vscode-icons:folder-type-config":"vpi-dd7ekob9 bg","vscode-icons:folder-type-typings":"vpi-8f60psvx bg","vscode-icons:folder-type-model":"vpi-5r1p1tog bg","vscode-icons:folder-type-template":"vpi-6vcutkfe bg","vscode-icons:folder-type-tools":"vpi-f7fps7at bg","vscode-icons:file-type-docker":"vpi-of7uasy1 bg","flat-color-icons:info":"vpi-71am65ta bg","material-symbols:home":"vpi-nqwkwjfp","skill-icons:vscode-dark":"vpi-v2ycmx22 bg","skill-icons:twitter":"vpi-p6gjqsfc bg","vscode-icons:file-type-js-official":"vpi-3ykuos9l bg","vscode-icons:file-type-css":"vpi-ts89625p bg"}

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
