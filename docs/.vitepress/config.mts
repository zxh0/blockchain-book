import { defineConfig } from 'vitepress'
import { sidebar, version } from './sidebar.json'

// sidebar.json 由 scripts/build-site.mjs 从 Book.md 生成
const chapters = sidebar.map((s) => s.link)

export default defineConfig({
  title: '人人能懂的区块链',
  description: '一本写给普通人的区块链入门书：零代码门槛，从哈希与签名两个黑盒子讲起。',
  lang: 'zh-CN',
  base: '/blockchain-book/',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/blockchain-book/favicon.svg' }],
    ['meta', { property: 'og:title', content: '人人能懂的区块链' }],
    ['meta', { property: 'og:image', content: 'https://zxh0.github.io/blockchain-book/aigc/book.png' }],
  ],

  markdown: {
    lineNumbers: false,
    image: { lazyLoading: true },
    // 书里有 $...$ 和 $$...$$ 公式，需要 markdown-it-mathjax3
    math: true,
  },

  themeConfig: {
    outline: { level: [2, 3], label: '本页目录' },

    nav: [
      { text: '开始阅读', link: chapters[0] },
      { text: 'PDF 下载', link: 'https://github.com/zxh0/blockchain-book/releases' },
      { text: `版本 ${version}`, link: 'https://github.com/zxh0/blockchain-book/commits/main' },
    ],

    sidebar: [{ text: '目录', items: sidebar }],

    socialLinks: [{ icon: 'github', link: 'https://github.com/zxh0/blockchain-book' }],

    editLink: {
      // 全书是单文件，改哪一章都指向 Book.md
      pattern: 'https://github.com/zxh0/blockchain-book/edit/main/Book.md',
      text: '在 GitHub 上纠错',
    },

    search: {
      provider: 'local',
      options: {
        // 默认分词器按空白切词，对中文几乎无效。这里把中文按字拆开建索引，
        // 配合 AND 组合，搜「智能合约」= 同时包含这四个字的页面。
        // 注意：这个函数会被序列化后送到浏览器执行，必须自包含。
        miniSearch: {
          options: {
            tokenize: (text: string) =>
              text
                .split(/[^\p{L}\p{N}_]+/u)
                .flatMap((w) => (/[一-鿿]/.test(w) ? w.split('') : [w]))
                .filter(Boolean),
            processTerm: (term: string) => term.toLowerCase(),
          },
          searchOptions: {
            combineWith: 'AND',
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 },
          },
        },
        translations: {
          button: { buttonText: '搜索全书', buttonAriaLabel: '搜索全书' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除',
            noResultsText: '没有找到',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    docFooter: { prev: '上一章', next: '下一章' },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    lastUpdated: { text: '最后更新' },
    outlineTitle: '本页目录',

    footer: {
      message: '本书以 CC0 1.0 协议发布，可自由使用',
      copyright: 'Copyright © 2025 zxh0',
    },
  },
})
