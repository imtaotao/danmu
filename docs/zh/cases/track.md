# 控制轨道数量和渲染

## 描述

本章节学习如何控制轨道，我们可以将轨道控制在具体的数量来渲染。

> [!NOTE] 提示
> 以下这些代码你都可以复制，然后粘贴在在线 [**demo**](https://imtaotao.github.io/danmu/) 的控制台上查看效果。


## 限制为几条连续的轨道

**限制为顶部 3 条弹幕：**

```ts {2,8-9}
// 如果我们希望轨道高度为 50px
manager.setTrackHeight('100% / 3');

// 如果不设置渲染区域，轨道的高度会根据默认的 container.height / 3 得到，
// 这可能导致轨道高度不是你想要的
manager.setArea({
  y: {
    start: 0,
    end: 150, // 3 条轨道的总高度为 150px
  },
});
```

**限制为中间 3 条弹幕：**

```ts {2,8-9}
// 如果我们希望轨道高度为 50px
manager.setTrackHeight('100% / 3');

// 如果不设置渲染区域，轨道的高度会根据默认的 container.height / 3 得到，
// 这可能导致轨道高度不是你想要的
manager.setArea({
  y: {
    start: `50%`,
    end: `50% + 150`, // 3 条轨道的总高度为 150px
  },
});
```

## 限制为几条不连续的轨道

限制为几条不连续的轨道，除了要做和连续轨道的操作之外，还需要借助 [**`willRender`**](../reference/manager-hooks/#hooks-willrender) 这个钩子来实现。

```ts {2,7-8,15,18-21}
// 如果我们希望轨道高度为 50px，并渲染 0，2，4 这几条轨道
manager.setTrackHeight('100% / 6');

// 设置容器的渲染区域
manager.setArea({
  y: {
    start: 0,
    end: 300, // 6 条轨道的总高度为 300px
  },
});

manager.use({
  willRender(ref) {
    // 高级弹幕和轨道不强相关，没有 trackIndex 这个属性
    if (ref.trackIndex === null) return ref;

    // 如果为 1，3，5 这几条轨道就阻止渲染，并重新添加等待下次渲染
    if (ref.trackIndex % 2 === 1) {
      ref.prevent = true;
      manager.unshift(ref.danmaku);
    }
    return ref;
  },
});
```
