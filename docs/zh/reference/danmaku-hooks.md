# 弹幕钩子

弹幕的钩子只会在弹幕自身的行为发生改变的时候进行触发。

**1. 通过 `manager` 注册**

```ts
// 通过 `manager` 来注册需要加上 `$` 前缀
import { create } from 'danmu';

const manager = create({
  plugin: {
    $hide(danmaku) {},
    $show(danmaku) {},
  },
});
```

**2. 通过弹幕实例来注册**

如果你在其他全局钩子里面拿到了弹幕实例，则可以通过下面这种方式注册，这在插件的编写中会很有用。

```ts
danmaku.use({
  hide(danmaku) {},
  show(danmaku) {},
});
```

## `hooks.hide`

**类型：`SyncHook<[Danmaku<T>]>`**

`hide` 钩子会在弹幕隐藏的时候触发。

## `hooks.show`

**类型：`SyncHook<[Danmaku<T>]>`**

`show` 钩子会在弹幕从隐藏到显示的时候触发。

## `hooks.pause`

**类型：`SyncHook<[Danmaku<T>]>`**

`pause` 钩子会在弹幕暂停的时候触发。

## `hooks.resume`

**类型：`SyncHook<[Danmaku<T>]>`**

`resume` 钩子会在弹幕从暂停恢复的时候触发。

## `hooks.moveStart`

**类型：`SyncHook<[Danmaku<T>]>`**

`moveStart` 钩子会在弹幕即将运动的时候触发，你可以在此时对弹幕做一些样式变更操作。

## `hooks.moveEnd`

**类型：`SyncHook<[Danmaku<T>]>`**

`moveEnd` 钩子会在弹幕运动结束的时候触发，运动结束不代表会立即销毁，为了性能考虑，内核引擎会批量收集统一销毁。

## `hooks.appendNode`

**类型：`SyncHook<[Danmaku<T>]>`**

`appendNode` 钩子会在弹幕的节点添加到容器时候触发，他在 `createNode` 节点之后。

## `hooks.removeNode`

**类型：`SyncHook<[Danmaku<T>]>`**

`removeNode` 钩子会在弹幕从容器中移除的时候触发。

## `hooks.createNode`

**类型：`SyncHook<[Danmaku<T>]>`**

`createNode` 钩子会在弹幕的内置 HTML 节点创建后时候触发，你可以在这个钩子里面通过 `danmaku.node` 拿到这个节点，**进行一些样式和节点的渲染操作，这是本框架扩展性很重要的一步操作，很重要**。

**示例：**

```tsx
function DanmakuComponent(props: { danmaku: Danmaku<unknown> }) {
  return <div>{props.danmaku.data.value}</div>;
}

manager.use({
  $createNode(danmaku) {
    // 将组件渲染到弹幕的内置节点上
    ReactDOM.createRoot(danmaku.node).render(
      <DanmakuComponent danmaku={danmaku} />,
    );
  },
});
```

## `hooks.destroyed`

**类型：`SyncHook<[Danmaku<T>, unknown]>`**

`destroyed` 钩子会在弹幕销毁的时候触发，如果你需要手动调用 [**`danmaku.destroy`**](../reference/danmaku-api/#danmaku-destroy) 方法，可以尝试传递 `mark`。

