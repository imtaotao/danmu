import { defineConfig } from 'vitepress';

export const sharedConfig = defineConfig({
  title: 'The danmu docs',
  appearance: 'dark',
  description:
    'Danmu 🌘 Collision detection, highly customized danmu screen styles, you deserve it',
  lang: 'zh',
  srcDir: 'src',
  srcExclude: ['__wip'],
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: 'https://github.com/Ubugeeei/chibivue/blob/main/book/images/logo/logo.png?raw=true',
      },
    ],
  ],
  themeConfig: {
    logo: 'https://github.com/Ubugeeei/chibivue/blob/main/book/images/logo/logo.png?raw=true',
    search: { provider: 'local' },
    outline: 'deep',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ubugeeei/chibivue' },
      { icon: 'twitter', link: 'https://twitter.com/ubugeeei' },
      { icon: 'discord', link: 'https://discord.gg/aVHvmbmSRy' },
    ],
    editLink: {
      pattern: 'https://github.com/imtaotao/danmu/blob/master/docs/:path',
      text: 'Suggest changes to this page',
    },
    footer: {
      copyright: `Copyright © 2023-${new Date().getFullYear()} imtaotao`,
      message: 'Released under the MIT License.',
    },
  },
});
