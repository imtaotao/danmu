import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import starlightBlog from 'starlight-blog';
import starlightThemeRapide from 'starlight-theme-rapide';

// https://astro.build/config
export default defineConfig({
  integrations: [
    // https://starlight.astro.build/zh-cn/reference/configuration/
    starlight({
      title: 'danmu',
      lastUpdated: true,
      customCss: ['./src/styles/landing.css'],
      editLink: {
        baseUrl: 'https://github.com/imtaotao/danmu/edit/main/docs/',
      },
      defaultLocale: 'zh-cn',
      locales: {
        en: {
          label: 'English',
          lang: 'en',
        },
        'zh-cn': {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
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
              link: 'getting-started',
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
      // components: {
      //   ThemeSelect: "./src/components/ThemeSelect.astro",
      // },
      plugins: [
        // starlightBlog(),
        starlightThemeRapide(),
        starlightLinksValidator(),
      ],
    }),
  ],
});
