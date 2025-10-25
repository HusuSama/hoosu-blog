import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/base.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+plugin-shiki@2.0._5d0f651a361f1b71ba1813342d414eb1/node_modules/@vuepress/plugin-shiki/lib/client/styles/shiki.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/line-numbers.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-highlight.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-diff.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-error-level.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-focus.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-highlight.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-word-highlight.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/whitespace.css"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/collapsed-lines.css"
import { setupCollapsedLines } from "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/index.js"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+highlighter-helpe_d6a4d9e1c61b6e041cacc4b6cccc62c8/node_modules/@vuepress/highlighter-helper/lib/client/styles/code-block-title.css"
import { enhanceTwoslash } from "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+shiki-twoslash@2._92ade02a7a46b1c60e7798de53e2d77d/node_modules/@vuepress/shiki-twoslash/lib/client/index.js"
import "D:/vpress-docs/blog/node_modules/.pnpm/@vuepress+shiki-twoslash@2._92ade02a7a46b1c60e7798de53e2d77d/node_modules/@vuepress/shiki-twoslash/lib/client/styles/twoslash.css"
export default {
  enhance({ app }) {
    enhanceTwoslash(app)
  },
  setup() {
    setupCollapsedLines()
  },
}
