import { defineConfig } from 'vitepress';

const base = 'danmu/document';

export const sharedConfig = defineConfig({
  base,
  title: 'The danmu Book',
  appearance: 'dark',
  description:
    'Danmu 🌘 Collision detection, highly customized danmu screen styles, you deserve it',
  lang: 'zh',
  lastUpdated: true,
  ignoreDeadLinks: true,
  rewrites: {
    'en/:rest*': ':rest*',
  },
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/x-icon', href: `/${base}/favicon.svg` },
    ],
  ],
  themeConfig: {
    logo: '/favicon.svg',
    search: { provider: 'local' },
    outline: 'deep',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/imtaotao/danmu' },
    ],
    editLink: {
      pattern: 'https://github.com/imtaotao/danmu/blob/master/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },
    footer: {
      copyright: `Copyright © 2019-${new Date().getFullYear()} imtaotao`,
      message: 'Released under the MIT License.',
    },
  },
});
