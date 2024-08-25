# Typescript Interface

## Description

The `TypeScript` type declarations for danmaku are very comprehensive, so when you use it in `TypeScript`, you will get excellent type hints. This is very friendly for a plugin-based system and can even be considered indispensable.

## Declare Danmaku Content Type

When you get the `danmaku` instance type in various hooks, the type of its **content** defaults to `unknown`. However, you can pass a generic type during initialization to constrain it.

```ts
import { create } from 'danmu';

const manager = create<{ content: string; img: string }>({
  $moveStart(danmaku) {
    // You can see that the `data` type is `{ content: string, img: string }`
    danmaku.data;
  },
});
```

## Pass a type to `statuses`

Since `manager.statuses` does not perform any work within the kernel, it simply provides a plain object for users to record states. Therefore, its default type is `Record<PropertyKey, unknown>`. You can also pass a generic type to change it. For a specific example, refer to our [**demo**](https://github.com/imtaotao/danmu/blob/master/demo/src/manager.tsx#L9).

```ts
import { create } from 'danmu';

const manager = create<string, { background: string }>();

// You can see that the `statuses` type is `{ background: string }`
manager.statuses;
```

## # Default Exported Type Declarations

Below are the types we export by default, which can assist you in writing business code or plugins.

```ts
// You can use all of these types
import type {
  Mode,
  StyleKey,
  Position,
  PushOptions,
  PushFlexOptions,
  ValueType,
  Direction,
  CreateOption,
  Danmaku,
  DanmakuType,
  DanmakuPlugin,
  ManagerPlugin,
} from 'danmu';
```
