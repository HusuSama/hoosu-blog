import './iconify.css'
export const icons = {"vscode-icons:folder-type-api":"vpi-fkchv7y9 bg","vscode-icons:default-file":"vpi-ape7rznk bg","vscode-icons:default-folder":"vpi-ixoqi3zl bg","vscode-icons:file-type-go":"vpi-91jwlwkg bg","vscode-icons:folder-type-docs":"vpi-0ve0o5jk bg","vscode-icons:file-type-json":"vpi-ew8v4ucd bg","vscode-icons:file-type-html":"vpi-j2hn4uo8 bg","vscode-icons:file-type-light-yaml":"vpi-9kxng6be bg","vscode-icons:folder-type-config":"vpi-bw3vs5d5 bg","vscode-icons:folder-type-typings":"vpi-scuwjuqp bg","vscode-icons:folder-type-model":"vpi-c65zr3jy bg","vscode-icons:folder-type-template":"vpi-vd8hhosq bg","vscode-icons:folder-type-tools":"vpi-iuhhmikv bg","material-symbols:home":"vpi-yat2lnxl","skill-icons:vscode-dark":"vpi-3hzolkrg bg","skill-icons:twitter":"vpi-cz43yt41 bg","vscode-icons:file-type-js-official":"vpi-8zupzoil bg","vscode-icons:file-type-css":"vpi-8rakvyjd bg","flat-color-icons:info":"vpi-3gg5fhvl bg","vscode-icons:file-type-docker":"vpi-uwa2f5yo bg"}

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
