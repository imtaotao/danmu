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
            text: 'Track Settings',
            link: '/en/cases/track-settings',
          },
          {
            text: 'Cooldown',
            link: '/en/cases/cooldown',
          },
          {
            text: 'Simplified Mode',
            link: '/en/cases/simplified-mode',
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
            text: 'Send Looping Danmaku',
            link: '/en/cases/loop',
          },
          {
            text: 'Send Danmaku with Images',
            link: '/en/cases/image',
          },
          {
            text: 'Custom Danmaku Styles',
            link: '/en/cases/custom-danmaku',
          },
          {
            text: 'Custom Container Styles',
            link: '/en/cases/custom-container',
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
            text: 'Live Streaming and Video',
            link: '/en/cases/recommend',
          },
        ],
      },
    ],
  },
};
