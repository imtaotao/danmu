# 直播和视频场景的建议

## 描述

由于在直播和视频直播中，弹幕的实时性要求比较高，而默认的[**碰撞算法配置为**](../reference/manager-configuration/#config-mode) `strict`，当不满足渲染条件的时候会延迟到满足渲染条件后才渲染，**所以你应当设置为 `adaptive`**，这会让引擎会先尝试进行碰撞检测，如果不满足条件会忽略碰撞算法而立即渲染。

## 示例

```ts {4,8}
// 在初始化的时候设置
const manager = create({
  // .
  mode: 'adaptive',
});

// 或者使用 `setMode()` api
manager.setMode('adaptive');
```

如果你想设置一条轨道内弹幕之间最小间距（仅当弹幕命中了碰撞检测的时候才会生效）

```ts
// 同一条轨道内弹幕的间距最小为 10px
manager.setGap(10);
```
