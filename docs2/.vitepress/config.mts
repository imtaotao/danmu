import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Danmu",
  description: "Danmu",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/zh-cn/guides/getting-started' },
      { text: 'API', link: '/zh-cn/reference/index' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: '快速开始', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
