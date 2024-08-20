当在视频和直播等场景中，由于有实时渲染的需求，当渲染的弹幕数量过多时，会造成页面卡顿，这里有两种方法来实现:

- 实现弹幕精简模式。
- 设置 [**`limits.view`**](../reference//manager-config/#config-limits) 来限制渲染的弹幕数量。

> [!NOTE] 提示
> 和实现弹幕冷却时间的功能一样，弹幕精简模式的实现也是依赖 [**`willRender`**](../reference/manager-hooks/#hooks-willrender) 这个钩子来实现。

## 以弹幕精简模式来实现

```ts {10}
import { random } from 'aidly';
import { create } from 'danmu';

// 创建 manager，定义发送弹幕的类型为 string
const manager = create<string>({
  plugin: {
    // 这里相比实现弹幕 cd，作为另一种实现对比，直接在初始化的时候插入默认插件来实现
    willRender(ref) {
      // 我们过滤 50% 的弹幕
      if (random(0, 100) < 50) {
        ref.prevent = true;
      }
      return ref;
    },
  },
});
```

## 设置 `limits.view` 来实现

```ts {7}
import { create } from 'danmu';

// 创建 manager，定义发送弹幕的类型为 string
const manager = create<string>({
  limits: {
    // 在页面视图容器中能够同时渲染的最大值为 100 个
    view: 100,
  },
});
```
