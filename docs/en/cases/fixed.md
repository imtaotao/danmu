# 固定弹幕在容器顶部

## Description

本章节将介绍如何将弹幕固定在某一位置，以 **`top`** 和 **`left`** 这两个位置举例。由于我们需要自定义位置，所以我们需要使用高级弹幕的能力。

> [!NOTE] 提示
> 以下这些代码你都可以复制，然后粘贴在在线 [**demo**](https://imtaotao.github.io/danmu/) 的控制台上查看效果。

## 将弹幕固定在顶部

**1. 固定在最顶部的位置：**

```ts {9-10}
// 这条弹幕将会居中距离顶部 10px 的位置悬停 5s
manager.pushFlexibleDanmaku(
  '弹幕内容',
  {
    duration: 5000,
    direction: 'none',
    position(danmaku, container) {
      return {
        x: `50% - ${danmaku.getWidth() / 2}`,
        y: 10, // 具体容器顶部的距离为 10px
      };
    },
  },
);
```

**2. 固定在顶部第 2 条轨道上：**

```ts {11-12}
// 这条弹幕将会在第二条轨道居中的位置悬停 5s
manager.pushFlexibleDanmaku(
  '弹幕内容',
  {
    duration: 5000,
    direction: 'none',
    position(danmaku, container) {
      // 渲染在第 3 条轨道中
      const { middle } = manager.getTrackLocation(2);
      return {
        x: `50% - ${danmaku.getWidth() / 2}`,
        y: middle - danmaku.getHeight() / 2,
      };
    },
  },
);
```

## 将弹幕固定在左边

```ts {9,11-12}
// 这条弹幕将会在容器中间距离左边 10px 的地方停留 5s
manager.pushFlexibleDanmaku(
  '弹幕内容',
  {
    duration: 5000,
    direction: 'none',
    position(danmaku, container) {
      // 渲染在第 3 条轨道中
      const { middle } = manager.getTrackLocation(2);
      return {
        x: 10,
        y: `50% - ${danmaku.getHeight() / 2}`,
      };
    },
  },
);
```
