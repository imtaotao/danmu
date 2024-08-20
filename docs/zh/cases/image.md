# 发送带图片的弹幕

## 描述

要让弹幕里面能够携带图片，这和前面的实现[**点赞/点踩**](./like)的功能类似，都是要在弹幕的节点内部添加自定义的内容，实际上不止图片，你可以往弹幕的节点里面**添加任何的内容。**

> [!NOTE] 提示
> 本章节的组件以 **React** 来实现演示。

## 开发弹幕组件

```tsx {4-5}
export function Danmaku({ danmaku }) {
  return (
    <div>
      <img src="https://abc.jpg" />
      {danmaku.data}
    </div>
  );
}
```

## 渲染弹幕

```tsx title="init.tsx" {9}
import ReactDOM from 'react-dom/client';
import { create } from 'danmu';
import { Danmaku } from './Danmaku';

const manager = create<string>({
  plugin: {
    // 将组件渲染到弹幕的内置节点上
    $createNode(danmaku) {
      ReactDOM.createRoot(danmaku.node).render(<Danmaku danmaku={danmaku} />);
    },
  },
});
```
