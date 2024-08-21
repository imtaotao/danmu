# 防遮挡功能的实现

## 描述

本章节将学习如何实现防遮挡功能，由于防遮挡功能需要定义被遮挡的范围，一般情况下，都是通过定义一个 `svg` 图片设置范围，然后通过 `CSS` 的 [**`maskImage`**](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image) 属性来实现，主要是有以下两个步骤需要你来实现。

> [!NOTE] 提示
>
> 1. 轮询获取需要防止被覆盖的 svg 图片，一般是通过 **AI** 来生成，不过也视业务属性来确定。
> 2. 调用 danmu 库提供的 [**`manager.updateOccludedUrl`**](../reference/manager-methods/#manager-updateoccludedurl) 来设置 `CSS` 属性。

## 示例

```ts {6,9}
(async function update() {
  const { url } = await fetch('https://abc.com/svg').then((res) => res.json());

  // 1. 更新蒙层（如果不传第二个参数，默认设置到 manager.container.node 上）
  // 2. url 也可以是 base64 图片，这可能会对你有帮助
  manager.updateOccludedUrl(url, '#Id');

  // 轮询请求
  setTimeout(() => update(), 1000);
})();
```

<div align="center">
<h2>danmu</h2>

[![build status](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml) [![NPM version](https://img.shields.io/npm/v/danmu.svg?color=a1b858&label=)](https://www.npmjs.com/package/danmu)

</div>

<div align="center">

<a href="https://imtaotao.github.io/danmu/">Online Demo</a>
&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://imtaotao.github.io/danmu/document/zh/">Documentation</a>

A powerful and flexible danmaku library based on [`hooks-plugin`](https://github.com/imtaotao/hooks-plugin).

</div>

<h1></h1>

```js
import { create } from 'danmu';

const manager = create(
  plugin: {
    $createNode({ node, data }) {
      // Render danmaku content to the DOM
      node.textContent = data;
    },
  },
);

// Initialize
manager.mount(document.getElementById('root'));
manager.startPlaying();

// Send danmuku
manager.push('danmaku content');
```
