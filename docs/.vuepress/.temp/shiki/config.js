import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/base.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+plugin-shiki@2.0.0-rc.121_@vuepress+shiki-twoslash@2.0.0-rc.121_typescript@5._0c453cfd47160cef091ebe149140dce0/node_modules/@vuepress/plugin-shiki/lib/client/styles/shiki.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/line-numbers.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-highlight.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-diff.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-error-level.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-focus.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-highlight.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-word-highlight.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/whitespace.css"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/collapsed-lines.css"
import { setupCollapsedLines } from "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/index.js"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+highlighter-helper@2.0.0-rc.118_@vueuse+core@14.1.0_vue@3.5.26_typescript@5.9_a9d0d08024df4fd9ee2fa0906bf9441c/node_modules/@vuepress/highlighter-helper/lib/client/styles/code-block-title.css"
import { enhanceTwoslash } from "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+shiki-twoslash@2.0.0-rc.121_typescript@5.9.3_vue@3.5.26_typescript@5.9.3__vue_0ab738722c5cac3a3731b917457d0afc/node_modules/@vuepress/shiki-twoslash/lib/client/index.js"
import "/Users/bytedance/docs/my-blog/node_modules/.pnpm/@vuepress+shiki-twoslash@2.0.0-rc.121_typescript@5.9.3_vue@3.5.26_typescript@5.9.3__vue_0ab738722c5cac3a3731b917457d0afc/node_modules/@vuepress/shiki-twoslash/lib/client/styles/twoslash.css"
export default {
  enhance({ app }) {
    enhanceTwoslash(app)
  },
  setup() {
    setupCollapsedLines()
  },
}
