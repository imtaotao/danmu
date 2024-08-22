# Filter Keywords

## Description

过滤关键字的功能实现我们在[**编写插件**](../guide/create-plugin)那一章节已经学习过。

> [!NOTE] 提示
> 过滤关键字的实现也是依赖 [**`willRender`**](../reference/manager-hooks/#hooks-willrender) 这个钩子来实现。

## 示例

```ts {4,12}
import { create } from 'danmu';

// 定义关键字列表
const keywords = ['a', 'c', 'e'];

// 创建 manager，定义发送弹幕的类型为 string
const manager = create<string>({
  plugin: {
    willRender(ref) {
      for (const word of keywords) {
        if (ref.danmaku.data.includes(word)) {
          ref.prevent = true;
          break;
        }
      }
      return ref;
    },
  },
});

// 会被过滤
manager.push('ab');

// 不会被过滤
manager.push('bd');
```
