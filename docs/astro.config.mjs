import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
  integrations: [
    // https://starlight.astro.build/zh-cn/reference/configuration/
    starlight({
      title: 'Danmaku',
      lastUpdated: true,
      defaultLocale: 'zh-CN',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/imtaotao/danmu',
        mastodon: 'https://imtaotao.github.io/danmu',
      },
      sidebar: [
        {
          label: '从这里开始',
          items: [
            {
              label: '快速入门',
              link: 'started',
            },
            {
              label: '在 TypeScript 中使用',
              link: 'typescript',
            },
          ],
        },
        {
          label: '指南',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'API',
          autogenerate: { directory: 'reference' },
        },
      ],
      customCss: ['./src/styles/theme.css', './src/styles/landing.css'],
      plugins: [starlightLinksValidator(), starlightBlog({ title: '博客' })],
    }),
  ],
});
