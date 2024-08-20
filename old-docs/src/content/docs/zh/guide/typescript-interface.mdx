---
title: TypeScript 类型
description: 学习如何在 TypeScript 中使用 Danmaku
sidebar:
  order: 1
---

Danmaku 的 `TypeSsript` 类型声明很完整齐全，所以当你在 `TypeSsript` 中使用时，你会得到很好的类型提示，这对于插件化系统来说会非常的友好，甚至可以说是不可或缺的。

### 声明弹幕内容类型

当你在各种钩子里面拿到的 `Danmaku` 实例类型时，其**弹幕内容**的类型默认为 `unknow`，但是你可以在初始化的时候传入范型来约束。

```ts title="init.ts"
import { create } from 'danmu';

const manager = create<{ content: string; img: string }>({
  $moveStart(danmaku) {
    // 你可以看到 data 类型为 { content: string, img: string }
    danmaku.data;
  },
});
```

### 给 `statuses` 传递类型

由于 `manager.statuses` 不会在内核中有任何工作，他仅仅是提供一个普通对象给用户记录状态使用的，所以默认类型为 `Record<PropertyKey, unknown>`，你也可以传递范型来改变他，具体的实例可以参考我们的 Demo。

```ts title="init.ts"
import { create } from 'danmu';

const manager = create<string, { background: string }>();

// 你可以看到 statuses 类型为 { background: string }
manager.statuses;
```

### 默认导出的类型声明

Danmaku 默认导出的一些类型，可以帮助你在业务代码编写中或者插件编写中提供一些帮助，以下是我们导出的类型。

```ts title="danmu/index.d.ts"
// 以下这些类型你都可以使用
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
