# 弹幕冷却时间

## 描述

在直播的场景中，当用户在短时间内高频率的发送弹幕时，会有刷屏的嫌疑，本章节会对这种场景给出一个简单的实现，你可以参考其原理和思想自行根据你的业务场景进行扩展。

> [!NOTE] 提示
> 我们主要依赖 [**`willRender`**](../reference/manager-hooks/#hooks-willrender) 这个钩子来实现。

## 根据弹幕内容来实现

```ts {13-23}
import { create } from 'danmu';

const cd = 3000;
const map = Object.create(null);

// 创建 manager，定义发送弹幕的类型为 string
const manager = create<string>({ ... });

// 写一个插件来专门处理弹幕 cd 的事情
manager.use({
  name: 'cd',
  willRender(ref) {
    const now = Date.now();
    const content = ref.danmaku.data;
    const prevTime = map[content];

    if (prevTime && now - prevTime < cd) {
      ref.prevent = true;
      console.warn(`"${content}" is blocked.`);
    } else {
      map[content] = now;
    }
    return ref;
  },
});

// ✔️ 成功
manager.push('弹幕内容'); // [!code hl]

// ❌ 被阻止
manager.push('弹幕内容'); // [!code error]

// ✔️ 成功
setTimeout(() => {
  manager.push('弹幕内容'); // [!code hl]
}, 3000)
```

## 根据用户 ID 来实现

```ts {12-22}
import { create } from 'danmu';

// 创建 manager，定义发送弹幕的类型为 { userId: number, content: string }
const manager = create<{ userId: number, content: string }>({ ... });

const cd = 3000;
const map = Object.create(null);

manager.use({
  name: 'cd',
  willRender(ref) {
    const now = Date.now();
    const { userId } = ref.danmaku.data;
    const prevTime = map[userId];

    if (prevTime && now - prevTime < cd) {
      ref.prevent = true;
      console.warn(`"${userId}" is blocked.`);
    } else {
      map[userId] = now;
    }
    return ref;
  },
});

// ✔️ 成功
manager.push({ useId: 1, content: 'content1' }); // [!code hl]

// ❌ 被阻止
manager.push({ useId: 1, content: 'content2' }); // [!code error]

// ✔️ 成功
setTimeout(() => {
  manager.push({ useId: 1, content: 'content3' }); // [!code hl]
}, 3000)
```
