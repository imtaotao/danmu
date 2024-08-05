<div align="center">
<h2>danmu</h2>

[![build status](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/imtaotao/danmu/actions/workflows/deploy.yml) [![NPM version](https://img.shields.io/npm/v/danmu.svg?color=a1b858&label=)](https://www.npmjs.com/package/danmu)

</div>

<div align="center">

[English](./README.md) | 简体中文

</div>

<h1></h1>

一个高度可扩展的 danmaku 库，具有强大的插件系统，防遮挡和碰撞检测，自定义样式，基于 `CSS`，`DOM` 和 [`hooks-plugin`](https://github.com/imtaotao/hooks-plugin) 实现

- 示例: https://imtaotao.github.io/danmu/
- 文档: https://imtaotao.github.io/danmu/document/zh/


### Usage

```js
import { create } from 'danmu';

const manager = create();

// 初始化
manager.mount(document.getElementById('root'));
manager.startPlaying();

// 发送弹幕
manager.push('弹幕内容');
```
