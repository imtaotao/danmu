# Anti-Blocking Feature

## Description

This section will teach you how to implement the anti-occlusion feature. Since the anti-occlusion feature requires defining the occluded area, it is generally done by defining an `svg` image to set the area and then using the `CSS` [**`maskImage`**](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image) property to achieve it. There are mainly two steps you need to implement.

> [!NOTE] Hint
>
> 1. Poll to get the `svg` image that needs to prevent occlusion, usually generated through **AI**, but it also depends on business requirements.
> 2. Call the danmu library's [**`manager.updateOccludedUrl`**](../reference/manager-api/#manager-updateoccludedurl) to set the `CSS` property.

## 示例

```ts {7,10}
(async function update() {
  const { url } = await fetch('https://abc.com/svg').then((res) => res.json());

  // 1. Update the mask (if the second parameter is not provided,
  //    it defaults to setting on `manager.container.node`)
  // 2. The url can also be a base64 image, which might be helpful for you
  manager.updateOccludedUrl(url, '#Id');

  // // Polling request
  setTimeout(() => update(), 1000);
})();
```
