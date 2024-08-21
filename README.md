<div align="center">
<h2>danmu</h2>

[![build status](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml) [![NPM version](https://img.shields.io/npm/v/danmu.svg?color=a1b858&label=)](https://www.npmjs.com/package/danmu)

</div>

<div align="center">

A powerful and flexible danmaku library based on [`hooks-plugin`](https://github.com/imtaotao/hooks-plugin).

<a href="https://imtaotao.github.io/danmu/">Online Examples</a>
&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://imtaotao.github.io/danmu/document/zh/">Documentation</a>

</div>

<h1></h1>

### 🚀 Getting Started

```ts
import { create } from 'danmu';

const manager = create<string>(
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
