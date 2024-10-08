# 点赞/点踩

## 描述

当我们停留在弹幕上时，可能会需要做一些操作，本章节会带你实现一个鼠标停留在弹幕上时弹出一个工具栏，拥有**点赞**和**点踩**这两个功能。

> [!NOTE] 提示
> 本章节的组件以 **React** 来实现演示。

## 开发弹幕组件

```tsx {22-23}
import { useState } from 'react';
import { Tool } from './Tool';

export function Danmaku({ danmaku }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      // 鼠标进入弹幕时，暂停弹幕的运动
      onMouseEnter={() => {
        danmaku.pause();
        setVisible(true);
      }}
      // 鼠标离开弹幕时，恢复运动
      onMouseLeave={() => {
        // 当处于冻结状态时，不要给恢复运动了（不过也视你的业务情况而定）
        if (manager.isFreeze()) return;
        danmaku.resume();
        setVisible(false);
      }}
    >
      {danmaku.data}
      {visible ? <Tool /> : null}
    </div>
  );
}
```

## 开发工具栏组件

```tsx {11-12}
export function Tool() {
  // 发送 `点赞/点踩` 的请求，将结果存储在数据库
  const send = (type: string) => {
    fetch('http://abc.com/like', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  };
  return (
    <div>
      <button onClick={() => send('good')}>点赞</button>
      <button onClick={() => send('not-good')}>点踩</button>
    </div>
  );
}
```

## 渲染弹幕

```tsx {9}
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
