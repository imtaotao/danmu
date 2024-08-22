import { DefaultTheme, LocaleSpecificConfig } from 'vitepress';

export const en: LocaleSpecificConfig<DefaultTheme.Config> = {
  themeConfig: {
    nav: [
      { text: 'Home', link: '/en' },
      { text: 'Start Learning', link: '/en/guide/getting-started' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/en/guide/getting-started' },
          { text: 'Writing Plugins', link: '/en/guide/create-plugin' },
          {
            text: 'Typescript Interface',
            link: '/en/guide/typescript-interface',
          },
        ],
      },
      {
        text: 'Manager',
        collapsed: false,
        items: [
          {
            text: 'Manager Configuration',
            link: '/en/reference/manager-configuration',
          },
          {
            text: 'Manager Hooks',
            link: '/en/reference/manager-hooks',
          },
          {
            text: 'Manager Properties',
            link: '/en/reference/manager-properties',
          },
          {
            text: 'Manager API',
            link: '/en/reference/manager-api',
          },
        ],
      },
      {
        text: 'Danmaku',
        collapsed: false,
        items: [
          {
            text: 'Danmaku Hooks',
            link: '/en/reference/danmaku-hooks',
          },
          {
            text: 'Danmaku Properties',
            link: '/en/reference/danmaku-properties',
          },
          {
            text: 'Danmaku API',
            link: '/en/reference/danmaku-api',
          },
        ],
      },
      {
        text: 'Common Use Cases',
        collapsed: false,
        items: [
          {
            text: 'Cooldown Time',
            link: '/en/cases/cooldown',
          },
          {
            text: 'Simplified Mode',
            link: '/en/cases/lite-mode',
          },
          {
            text: 'Filter Keywords',
            link: '/en/cases/filter-keyword',
          },
          {
            text: 'Like/Dislike',
            link: '/en/cases/like',
          },
          {
            text: 'Custom Danmaku Styles',
            link: '/en/cases/style-danmaku',
          },
          {
            text: 'Custom Container Styles',
            link: '/en/cases/style-container',
          },
          {
            text: 'Send Danmaku with Images',
            link: '/en/cases/image',
          },
          {
            text: 'Send Looping Danmaku',
            link: '/en/cases/loop',
          },
          {
            text: 'Pin Danmaku to the Top',
            link: '/en/cases/fixed',
          },
          {
            text: 'Anti-Blocking Feature',
            link: '/en/cases/anti-occlusion',
          },
          {
            text: 'Control Track Quantity',
            link: '/en/cases/track',
          },
          {
            text: 'Live Streaming and Video',
            link: '/en/cases/recommend',
          },
        ],
      },
    ],
  },
};
