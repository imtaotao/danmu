import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightThemeRapide from 'starlight-theme-rapide';
// import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
  base: '/danmu/document',
  integrations: [
    // https://starlight.astro.build/zh-cn/reference/configuration/
    starlight({
      title: 'Danmu 💬',
      lastUpdated: true,
      customCss: ['./src/styles/landing.css'],
      editLink: {
        baseUrl: 'https://github.com/imtaotao/danmu/edit/main/docs/',
      },
      defaultLocale: 'zh',
      locales: {
        // en: {
        //   label: 'English',
        //   lang: 'en',
        // },
        zh: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      social: {
        github: 'https://github.com/imtaotao/danmu',
      },
      sidebar: [
        {
          label: '指南',
          autogenerate: { directory: 'guide' },
        },
        {
          label: '参考',
          autogenerate: { directory: 'reference' },
        },
      ],
      // components: {
      //   ThemeSelect: "./src/components/ThemeSelect.astro",
      // },
      plugins: [
        // starlightBlog(),
        starlightThemeRapide(),
      ],
    }),
  ],
});
