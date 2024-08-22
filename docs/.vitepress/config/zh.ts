import { DefaultTheme, LocaleSpecificConfig } from 'vitepress';

export const zh: LocaleSpecificConfig<DefaultTheme.Config> = {
  themeConfig: {
    nav: [
      { text: '主页', link: '/zh' },
      { text: '快速开始', link: '/zh/guide/getting-started' },
    ],
    sidebar: [
      {
        text: '指南',
        collapsed: false,
        items: [
          { text: '快速开始', link: '/zh/guide/getting-started' },
          { text: '编写插件', link: '/zh/guide/create-plugin' },
          { text: 'Typescript 类型', link: '/zh/guide/typescript-interface' },
        ],
      },
      {
        text: 'manager',
        collapsed: false,
        items: [
          {
            text: 'manager 配置',
            link: '/zh/reference/manager-configuration',
          },
          {
            text: 'manager 钩子',
            link: '/zh/reference/manager-hooks',
          },
          {
            text: 'manager 属性',
            link: '/zh/reference/manager-properties',
          },
          {
            text: 'manager 方法',
            link: '/zh/reference/manager-api',
          },
        ],
      },
      {
        text: '弹幕',
        collapsed: false,
        items: [
          {
            text: '弹幕钩子',
            link: '/zh/reference/danmaku-hooks',
          },
          {
            text: '弹幕属性',
            link: '/zh/reference/danmaku-properties',
          },
          {
            text: '弹幕方法',
            link: '/zh/reference/danmaku-api',
          },
        ],
      },
      {
        text: '常见 case',
        collapsed: false,
        items: [
          {
            text: '轨道设置',
            link: '/zh/cases/track-settings',
          },
          {
            text: '弹幕冷却时间',
            link: '/zh/cases/cooldown',
          },
          {
            text: '弹幕精简模式',
            link: '/zh/cases/simplified-mode',
          },
          {
            text: '过滤关键字',
            link: '/zh/cases/filter-keyword',
          },
          {
            text: '点赞/点踩',
            link: '/zh/cases/like',
          },
          {
            text: '发送循环弹幕',
            link: '/zh/cases/loop',
          },
          {
            text: '发送带图片的弹幕',
            link: '/zh/cases/image',
          },

          {
            text: '自定义弹幕样式',
            link: '/zh/cases/custom-danmaku',
          },
          {
            text: '自定义容器样式',
            link: '/zh/cases/custom-container',
          },
          {
            text: '固定弹幕在容器顶部',
            link: '/zh/cases/fixed',
          },
          {
            text: '防遮挡功能的实现',
            link: '/zh/cases/anti-occlusion',
          },
          {
            text: '直播和视频场景的建议',
            link: '/zh/cases/recommend',
          },
        ],
      },
    ],
  },
};
