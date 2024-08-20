# manager 钩子

manager 的钩子包含 `manager` 自身的钩子和 `弹幕` 的钩子。

> [!NOTE] 注意
>
> 1. 弹幕钩子和全局钩子以 **`$`** 前缀作为区分。
> 2. 这里只会介绍 `manager` **自身的钩子**，因为弹幕钩子会在[**弹幕钩子章节**](./danmaku-hooks)介绍。

## 1. 创建 `manager` 时注册

**示例：**

```ts
import { create } from 'danmu';

const manager = create({
  plugin: {
    start() {},
    stop() {},
  },
});
```

## 2. 通过 `manager.use` 来注册

[**`manager.use()`**](./manager-methods/#manager-use) 是用来注册插件的 api，如果你有外部插件，也可以通过此方法来注册。

**示例：**

```ts
manager.use({
  start() {},
  stop() {},
});
```

## `hooks.init`

**类型：`SyncHook<[manager: Manager<T>]>`**

`init` 钩子会在创建 `manager` 的时候触发，一般情况下只有当你通过 `create` 方法创建 `manager` 的时候才会用到，这只是一个语法糖让你方便拿到 `manager` 实例。

## `hooks.push`

**类型：`SyncHook<[PushData<T>, DanmakuType, boolean]>`**

`push` 钩子会在发送弹幕的时候触发，调用 `manager.push()`，`manager.unshift()`，和 `manager.pushFlexibleDanmaku()` 的时候都会触发，你可以在此钩子拿到将要发送的弹幕数据，弹幕类型，是否是 `unshift` 等。

## `hooks.start`

**类型：`SyncHook`**

`start` 钩子会在渲染引擎启动的时候触发，调用 `manager.startPlaying()` 的时候才会触发。

## `hooks.stop`

**类型：`SyncHook`**

`stop` 钩子会在渲染引擎关闭的时候触发，调用 `manager.stopPlaying()` 的时候才会触发。

## `hooks.show`

**类型：`SyncHook`**

`show` 钩子会在批量将弹幕从隐藏状态改为显示状态的时候触发，调用 `manager.show()` 的时候才会触发。

## `hooks.hide`

**类型：`SyncHook`**

`hide` 钩子会在批量将弹幕隐藏的时候触发，调用 `manager.hide()` 的时候才会触发。

## `hooks.clear`

**类型：`SyncHook`**

`clear` 钩子会在清空当前渲染和内存中的弹幕和弹幕数据的时候触发，调用 `manager.clear()` 的时候才会触发。

## `hooks.mount`

**类型：`SyncHook<[HTMLElement]>`**

`mount` 钩子会在将容器挂载到指定 `DOM` 节点的时候触发，你可以在钩子里面拿到挂载的节点，调用 `manager.mount()` 的时候才会触发。

## `hooks.unmount`

**类型：`SyncHook<[HTMLElement | null]>`**

`unmount` 钩子会在将容器从当前挂载的节点卸载的时候触发，你可以在钩子里面拿到将要卸载的节点，如果有的话，调用 `manager.unmount()` 的时候才会触发。

## `hooks.freeze`

**类型：`SyncHook`**

`freeze` 钩子会在冻结当前渲染的弹幕时候触发，调用 `manager.freeze()` 的时候才会触发。

## `hooks.unfreeze`

**类型：`SyncHook`**

`unfreeze` 钩子会在当前弹幕从冻结解除时候触发，调用 `manager.unfreeze()` 的时候才会触发。

## `hooks.format`

**类型：`SyncHook`**

`format` 钩子会在容器格式化的时候触发，调用 `manager.format()` 手动格式化的时候才会触发。

## `hooks.render`

**类型：`SyncHook<[DanmakuType]>`**

`render` 钩子会在每一次轮询渲染的时候触发。

## `hooks.willRender`

**类型：`SyncWaterfallHook<RenderData>`**

```ts
interface RenderData {
  type: DanmakuType;
  prevent: boolean;
  danmaku: Danmaku<T>;
  trackIndex: null | number;
}
```

`willRender` 钩子会在弹幕即将要进入渲染队列的时候触发，你可以在此钩子阻止弹幕渲染，这对于通过**关键字**或者**轨道 index** 来过滤弹幕的功能实现很有用。

## `hooks.finished`

**类型：`SyncHook`**

`finished` 钩子会在当前内存中的所有弹幕渲染完毕的时候触发，但是不代表以后就不会渲染弹幕了，因为你还可能继续在发送新的弹幕。

## `hooks.limitWarning`

**类型：`SyncHook<[DanmakuType, number]>`**

`limitWarning` 钩子会在超过内存弹幕容量阈值的时候触发，如果你没有设置此钩子，则会在控制台抛出告警，如果你想取消控制台告警，可以自行添加此钩子处理。

## `hooks.updateOptions`

**类型：`SyncHook<[Partial<ManagerOptions>]>`**

`updateOptions` 钩子会在更新配置的时候触发，调用 `manager.updateOptions()` 的时候才会触发，你可以在此钩子拿到新的配置。

> [!NOTE] 注意事项
> 实际上很多更改配置的方法，例如 `manager.setRate` 等，底层都是调用的 `manager.updateOptions()` 方法，也是会触发此钩子的。
