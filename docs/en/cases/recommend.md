# Live Streaming and Video

## Description

In live streaming and video streaming, the real-time requirement for danmaku is relatively high. The default [**collision algorithm configuration**](../reference/manager-configuration/#config-mode) is `strict`, which delays rendering until the rendering conditions are met. **Therefore, you should set it to `adaptive`**. This will make the engine attempt collision detection first, and if the conditions are not met, it will ignore the collision algorithm and render immediately.

## Example

```ts {4,8}
// Set it during initialization
const manager = create({
  // .
  mode: 'adaptive',
});

// Or use the `setMode()` API
manager.setMode('adaptive');
```

If you want to set the minimum spacing between danmaku within a single track (only effective when danmaku hit collision detection)

```ts
The minimum spacing between danmaku within the same track is `10px`
manager.setGap(10);
```
