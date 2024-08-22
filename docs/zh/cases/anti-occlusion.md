# 防遮挡功能的实现

## 描述

本章节将学习如何实现防遮挡功能，由于防遮挡功能需要定义被遮挡的范围，一般情况下，都是通过定义一个 `svg` 图片设置范围，然后通过 `CSS` 的 [**`maskImage`**](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image) 属性来实现，主要是有以下两个步骤需要你来实现。

> [!NOTE] 提示
>
> 1. 轮询获取需要防止被覆盖的 svg 图片，一般是通过 **AI** 来生成，不过也视业务属性来确定。
> 2. 调用 danmu 库提供的 [**`manager.updateOccludedUrl`**](../reference/manager-api/#manager-updateoccludedurl) 来设置 `CSS` 属性。

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
