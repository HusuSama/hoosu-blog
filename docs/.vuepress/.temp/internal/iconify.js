import './iconify.css'
export const icons = {"flat-color-icons:info":"vpi-vd15de1q bg","vscode-icons:folder-type-api":"vpi-19goik3l bg","vscode-icons:default-file":"vpi-r7cest4m bg","vscode-icons:default-folder":"vpi-p8itrq5h bg","vscode-icons:file-type-go":"vpi-rpjybfhr bg","vscode-icons:folder-type-docs":"vpi-1wmlf9o0 bg","vscode-icons:file-type-json":"vpi-k0jlj4wr bg","vscode-icons:file-type-html":"vpi-ugrjelis bg","vscode-icons:file-type-light-yaml":"vpi-yuz5nc5m bg","vscode-icons:folder-type-config":"vpi-hkaxmsyu bg","vscode-icons:folder-type-typings":"vpi-02wzgnje bg","vscode-icons:folder-type-model":"vpi-v2bt6om1 bg","vscode-icons:folder-type-template":"vpi-ask48x9l bg","vscode-icons:folder-type-tools":"vpi-4vtscj65 bg","vscode-icons:file-type-docker":"vpi-1ithen4t bg"}

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
