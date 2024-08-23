# Pin Danmaku to the Top

## Description

This section will introduce how to fix danmaku at a specific position, using **`top`** and **`left`** as examples. Since we need to customize the position, we will use the capabilities of flexible danmaku.

> [!NOTE] Hint
> You can copy and paste the following code into the console of the online [**demo**](https://imtaotao.github.io/danmu/) to see the effect.

## Fixing Danmaku at the Top

**1. Fixed at the very top:**

```ts {7-8}
// This danmaku will hover 10px from the top, centered, for 5 seconds
manager.pushFlexibleDanmaku('弹幕内容', {
  duration: 5000,
  direction: 'none',
  position(danmaku, container) {
    return {
      x: `50% - ${danmaku.getWidth() / 2}`,
      y: 10, // `10px` from the top of the container
    };
  },
});
```

**2. Fixed on the 2nd track from the top:**

```ts {9-10}
// This danmaku will hover in the center of the second track for 5s
manager.pushFlexibleDanmaku('content', {
  duration: 5000,
  direction: 'none',
  position(danmaku, container) {
    // Render in the 3rd track
    const { middle } = manager.getTrackLocation(2);
    return {
      x: `50% - ${danmaku.getWidth() / 2}`,
      y: middle - danmaku.getHeight() / 2,
    };
  },
});
```

## Fixing Danmaku on the Left

```ts {7,9-10}
// This danmaku will stay `10px` from the left in the middle of the container for 5s.
manager.pushFlexibleDanmaku('弹幕内容', {
  duration: 5000,
  direction: 'none',
  position(danmaku, container) {
    // Render in the 3rd track
    const { middle } = manager.getTrackLocation(2);
    return {
      x: 10,
      y: `50% - ${danmaku.getHeight() / 2}`,
    };
  },
});
```
