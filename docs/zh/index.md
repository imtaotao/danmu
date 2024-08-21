---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Danmaku'
  text: '强大可扩展的弹幕库'
  tagline: Danmu 是一个用来管理，渲染，发送弹幕的库，覆盖了很多业务场景并且提供了好用的扩展方式。
  image: /logo.svg
  actions:
    - theme: brand
      text: 快速开始 ->
      link: /zh/guide/getting-started
    - theme: alt
      text: 在线示例
      link: https://imtaotao.github.io/danmu/

features:
  - title: 多种渲染算法
    details: 我们提供了严格的碰撞检测算法，也提供了渐进式的碰撞检测算法，以及普通的全量实时渲染算法。
    icon: 🔍
  - title: 丰富的 api
    details: 提供了很多业务场景需要的 api，最大程度的简化开发方式。
    icon: 🌟
  - title: 可自定义样式
    details: 弹幕的渲染层由 CSS 提供，可以绘制任何适用 DOM 的弹幕需求，样式规则完全复用 CSS，没有额外的学习成本。
    icon: 🧩
  - title: 插件化
    details: 我们提供了丰富的钩子，这允许你方便的开发插件来满足更加定制化的需求，这是非常强大的能力。
    icon: 🔌
---
