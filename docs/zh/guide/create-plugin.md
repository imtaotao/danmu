# 编写插件

编写一个插件是很简单的，但是借助内核暴露出来的`钩子`和 `API`，你可以很轻松的实现强大且定制化的需求。

## 描述

由于内核没有暴露出来**根据条件来实现过滤弹幕**的功能，原因在于内核不知道弹幕内容的数据结构，这和业务的诉求强相关，所以我们在此通过插件来实现**精简弹幕**的功能用来演示。

## 💻 编写一个插件

> [!NOTE] 提示
>
> - 你编写的插件应当取一个 `name`，以便于调试定位问题（注意不要和其他插件冲突了）。
> - 插件可以选择性的声明一个 `version`，这在你的插件作为独立包发到 `npm` 上时很有用。

```ts {10,14}
export function filter({ userIds, keywords }) {
  return (manager) => {
    return {
      name: 'filter-keywords-or-user',
      version: '1.0.0', // version 字段不是必须的
      willRender(ref) {
        const { userId, content } = ref.danmaku.data.value;
        console.log(ref.type); // 可以根据此字段来区分是普通弹幕还是高级弹幕

        if (userIds && userIds.includes(userId)) {
          ref.prevent = true;
        } else if (keywords) {
          for (const word of keywords) {
            if (content.includes(word)) {
              ref.prevent = true;
              break;
            }
          }
        }
        return ref;
      },
    };
  };
}
```

## 🛠️ 注册插件

你需要通过 `manager.use()` 来注册插件。

```ts {9-12}
import { create } from 'danmu';

const manager = create<{
  userId: number;
  content: string;
}>();

manager.use(
  filter({
    userIds: [1],
    keywords: ['菜'],
  }),
);
```

## 💬 发送弹幕

- ❌ **会**被插件阻止渲染

```ts {2}
manager.push({
  userId: 1,
  content: '',
});
```

- ❌ **会**被插件阻止渲染

```ts {3}
manager.push({
  userId: 2,
  content: '你真菜',
});
```

- ✔️ **不会**被插件阻止渲染

```ts {2}
manager.push({
  userId: 2,
  content: '',
});
```

- ✔️ **不会**被插件阻止渲染

```ts {3}
manager.push({
  userId: 2,
  content: '你真棒',
});
```
