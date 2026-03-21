import { defineClientConfig } from 'vuepress/client'
import Tabs from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/Tabs.vue'
import CodeTabs from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/CodeTabs.vue'
import PDFViewer from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/PDFViewer.vue'
import CodePen from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/CodePen.vue'
import JSFiddle from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/JsFiddle.vue'
import Replit from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/Replit.vue'
import CodeSandbox from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/CodeSandbox.vue'
import Plot from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/Plot.vue'
import CanIUse from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/CanIUse.vue'
import FileTreeNode from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/FileTreeNode.vue'
import VPDemoBasic from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/VPDemoBasic.vue'
import VPDemoNormal from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/VPDemoNormal.vue'
import Annotation from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/Annotation.vue'
import Abbreviation from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/Abbreviation.vue'
import VPTable from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/components/VPTable.vue'
import { setupMarkHighlight } from 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/composables/mark.js'

import 'D:/Docs/hoosu-blog/node_modules/.pnpm/vuepress-plugin-md-power@1._480f5fa87b8e78895dec12786d32db93/node_modules/vuepress-plugin-md-power/lib/client/styles/index.css'

export default defineClientConfig({
  enhance({ router, app }) {
    app.component('Tabs', Tabs)
    app.component('CodeTabs', CodeTabs)
    app.component('PDFViewer', PDFViewer)
    app.component('CodePenViewer', CodePen)
    app.component('JSFiddleViewer', JSFiddle)
    app.component('ReplitViewer', Replit)
    app.component('CodeSandboxViewer', CodeSandbox)
    app.component('Plot', Plot)
    app.component('CanIUseViewer', CanIUse)
    app.component('FileTreeNode', FileTreeNode)
    app.component('VPDemoBasic', VPDemoBasic)
    app.component('VPDemoNormal', VPDemoNormal)
    app.component('Annotation', Annotation)
    app.component('Abbreviation', Abbreviation)
    app.component('VPTable', VPTable)
  },
  setup() {
        setupMarkHighlight("eager")

  }
})
