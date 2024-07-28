import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Danmaku',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/imtaotao/danmu',
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
      plugins: [starlightLinksValidator(), starlightBlog()],
    }),
  ],
});
