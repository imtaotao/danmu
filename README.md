<div align="center">
<h2>danmu</h2>

[![build status](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml) [![NPM version](https://img.shields.io/npm/v/danmu.svg?color=a1b858&label=)](https://www.npmjs.com/package/danmu)

</div>

<div align="center">

English | [简体中文](./README.zh-CN.md)

</div>

<h1></h1>

A highly extensible danmaku library with a robust plugin system, occlusion prevention, and collision detection, implemented based on `CSS`, `DOM`, and [`hooks-plugin`](https://github.com/imtaotao/hooks-plugin).

- Demo: https://imtaotao.github.io/danmu/
- Document: https://imtaotao.github.io/danmu/document/zh/


### Usage

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

