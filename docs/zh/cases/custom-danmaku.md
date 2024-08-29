# 自定义弹幕样式

## 描述

由于我们可以拿到弹幕的 DOM 节点，所以可以很方便的自定义 CSS 样式，主要是通过 [**`manager.setStyle`**](../reference/manager-api/#manager-setstyle) 和 [**`danmaku.setStyle`**](../reference/danmaku-api/#danmaku-setstyle) 这两个 api 来实现。

> [!NOTE] 提示
> 通过官方提供的 api 设置的样式，只会作用于弹幕的根节点上，也就是 [**`danmaku.node`**](../reference/danmaku-props/#danmaku-node)。

## 通过 `manager.setStyle` 来设置

```ts {14}
import { create } from 'danmu';

// 需要添加的样式
const styles = {
  color: 'red',
  fontSize: '15px',
  // .
};

const manager = create();

// 后续渲染的弹幕和当前已经渲染的弹幕会设置上这些样式。
for (const key in styles) {
  manager.setStyle(key, styles[key]);
}
```

## 通过 `danamaku.setStyle` 来设置

在这种实现中，真实的业务场景里面你可能需要借用 [**`manager.statuses`**](../reference/manager-properties/#manager-statuses) 来简化实现。

```ts {15,26}
import { create } from 'danmu';

// 需要添加的样式
const styles = {
  color: 'red',
  fontSize: '15px',
  // .
};

// 初始化的时候添加钩子处理，这样当有新的弹幕渲染时会自动添加上这些样式
const manager = create({
  plugin: {
    $moveStart(danmaku) {
      for (const key in styles) {
        danmaku.setStyle(key, styles[key]);
      }
      // 你也可以在这里给弹幕 DOM 添加 className
      danmaku.node.classList.add('className');
    },
  },
});

// 对当前正在渲染的弹幕添加样式
manager.asyncEach((danmaku) => {
  for (const key in styles) {
    danmaku.setStyle(key, styles[key]);
  }
});
```
