# Custom Container Styles

## Description

我们主要是通过 [**`manager.container.setStyle`**](../reference/manager-properties/#manager-container-setstyle) 这个 api 来实现。

> [!NOTE] 提示
> 通过官方提供的 api 设置的样式，只会作用于容器的根节点上，也就是 [**`manager.container.node`**](../reference/manager-properties/#manager-container-node)。

## 示例

```ts {14,24}
import { create } from 'danmu';

// 需要添加的样式
const styles = {
  background: 'red',
  // .
};

const manager = create({
  plugin: {
    // 你可以在初始化的时候添加钩子处理
    init(manager) {
      for (const key in styles) {
        manager.container.setStyle(key, styles[key]);
      }
      // 你也可以在这里给容器 DOM 添加 className
      manager.container.node.classList.add('className');
    },
  },
});

// 或者直接调用 api
for (const key in styles) {
  manager.container.setStyle(key, styles[key]);
}
```
