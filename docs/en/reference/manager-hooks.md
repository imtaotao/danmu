# Manager Hooks

The hooks for the manager include both the hooks for the `manager` itself and the hooks for the `danmaku`.

> [!NOTE] Tip
>
> 1. Danmaku hooks and global hooks are distinguished by the **`$`** prefix.
> 2. This section will only introduce the hooks for the `manager` itself, as danmaku hooks will be covered in the [**danmaku hooks section**](./danmaku-hooks).

## 1. Register during initialization

**Example:**

```ts
import { create } from 'danmu';

const manager = create({
  plugin: {
    start() {},
    stop() {},
  },
});
```

## 2. Register through `use`

The [**`manager.use()`**](./manager-api/#manager-use) API is used to register plugins. If you have external plugins or self-written plugins available, you can also register them using this method.

**Example:**

```ts
manager.use({
  start() {},
  stop() {},
});
```

## `hooks.init`

**Type: `SyncHook<[manager: Manager<T>]>`**

The `init` hook is triggered when the `manager` is created. Generally, you will only use this when creating the `manager` through the `create` method. This is just syntactic sugar to conveniently get the `manager` instance.

```ts {3}
const manager = create({
  plugin: {
    init(manager) {
      // .
    },
  },
});
```

## `hooks.push`

**Type: `SyncHook<[PushData | Danmaku<PushData>, DanmakuType, boolean]>`**

The `push` hook is triggered when sending danmaku. It is triggered when calling `manager.push()`, `manager.unshift()`, and `manager.pushFlexibleDanmaku()`. You can use this hook to access the danmaku data to be sent, the danmaku type, whether it is `unshift`, and more.

```ts {6}
const manager = create({
  plugin: {
    push(data, type, isUnshift) {
      if (manager.isDanmaku(data)) return;
      // Handle flexible danmaku
      if (type === 'flexible') {
        // .
      } else {
        // .
      }
    },
  },
});
```

## `hooks.start`

**Type: `SyncHook`**

The `start` hook is triggered when the rendering engine starts. It is only triggered when calling `manager.startPlaying()`.

## `hooks.stop`

**Type: `SyncHook`**

The `stop` hook is triggered when the rendering engine stops. It is only triggered when calling `manager.stopPlaying()`.

## `hooks.show`

**Type: `SyncHook`**

The `show` hook is triggered when danmaku are batch changed from hidden to visible. It is only triggered when calling `manager.show()`.

## `hooks.hide`

**Type: `SyncHook`**

The `hide` hook is triggered when danmaku are batch hidden. It is only triggered when calling `manager.hide()`.

## `hooks.clear`

**Type: `SyncHook`**

The `clear` hook is triggered when clearing the currently rendered danmaku and danmaku data from memory. It is only triggered when calling `manager.clear()`.

## `hooks.mount`

**Type: `SyncHook<[HTMLElement]>`**

The `mount` hook is triggered when the container is mounted to a specified `DOM` node. You can access the mounted node within the hook. It is only triggered when calling `manager.mount()`.

## `hooks.unmount`

**Type: `SyncHook<[HTMLElement | null]>`**

The `unmount` hook is triggered when the container is unmounted from the currently mounted node. You can access the node to be unmounted within the hook, if there is one. It is only triggered when calling `manager.unmount()`.

## `hooks.freeze`

**Type: `SyncHook`**

The `freeze` hook is triggered when the currently rendered danmaku are frozen. It is only triggered when calling `manager.freeze()`.

## `hooks.unfreeze`

**Type: `SyncHook`**

The `unfreeze` hook is triggered when the currently frozen danmaku are unfrozen. It is only triggered when calling `manager.unfreeze()`.

## `hooks.format`

**Type: `SyncHook`**

The `format` hook is triggered when the container is formatted. It is only triggered when manually formatting by calling `manager.format()`.

## `hooks.render`

**Type: `SyncHook<[DanmakuType]>`**

The `render` hook is triggered during each rendering poll.

## `hooks.willRender`

**Type: `SyncWaterfallHook<RenderData>`**

```ts
interface RenderData {
  type: DanmakuType;
  prevent: boolean;
  danmaku: Danmaku<T>;
  trackIndex: null | number;
}
```

The `willRender` hook is triggered just before the danmaku enters the rendering queue. You can use this hook to prevent the danmaku from rendering. This is useful for implementing features that filter danmaku based on **keywords** or **track index**.

## `hooks.finished`

**Type: `SyncHook`**

The `finished` hook is triggered when all danmaku in the current memory have been rendered. However, this does not mean that no more danmaku will be rendered in the future, as you may continue to send new danmaku.

## `hooks.limitWarning`

**Type: `SyncHook<[DanmakuType, number]>`**

The `limitWarning` hook is triggered when the memory danmaku capacity threshold is exceeded. If you do not set this hook, a warning will be thrown in the console. If you want to cancel the console warning, you can add this hook to handle it yourself.

## `hooks.updateOptions`

**Type: `SyncHook<[Partial<ManagerOptions>]>`**

The `updateOptions` hook is triggered when the configuration is updated. It is only triggered when calling `manager.updateOptions()`. You can use this hook to access the new configuration.

> [!NOTE] Tip
> In fact, many methods for changing configurations, such as `manager.setRate`, internally call the `manager.updateOptions()` method, which also triggers this hook.
