# Track Settings

## Description

This section teaches you how to control tracks. We can control the number of tracks to render a specific quantity.

> [!NOTE] Hint
> You can copy and paste the following code into the console of the online [**demo**](https://imtaotao.github.io/danmu/) to see the effect.

## Limiting to a Few Consecutive Tracks

**Limit to the top 3 tracks:**

```ts {2,8-10}
// If we want the track height to be `50px`.
manager.setTrackHeight('100% / 3');

// If the rendering area is not set, the track height will be determined by the default `container.height / 3`,
// which may result in a track height that is not what you want
manager.setArea({
  y: {
    start: 0,
    // The total height of 3 tracks is `150px`
    end: 150,
  },
});
```

**Limit to the middle 3 tracks:**

```ts {1,5-6}
manager.setTrackHeight('100% / 3');

manager.setArea({
  y: {
    start: `50%`,
    end: `50% + 150`,
  },
});
```

## Limiting to a Few Non-Consecutive Tracks

To limit to a few non-consecutive tracks, in addition to the operations for consecutive tracks, you also need to leverage the [**`willRender`**](../reference/manager-hooks/#hooks-willrender) hook.

```ts {2,7-9,16,20-23}
// If we want the track height to be `50px` and render tracks `0, 2, and 4`
manager.setTrackHeight('100% / 6');

// Set the rendering area of the container
manager.setArea({
  y: {
    start: 0,
    // The total height of 6 tracks is 300px
    end: 300,
  },
});

manager.use({
  willRender(ref) {
    // Flexible danmaku is not strongly related to tracks and does not have the `trackIndex` attribute
    if (ref.trackIndex === null) return ref;

    // If it is tracks `1, 3, and 5`,
    // prevent rendering and re-add them to wait for the next rendering
    if (ref.trackIndex % 2 === 1) {
      ref.prevent = true;
      manager.unshift(ref.danmaku);
    }
    return ref;
  },
});
```
