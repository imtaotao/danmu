# Danmaku Hooks

Danmaku hooks are only triggered when the behavior of the danmaku itself changes.

**1. Register through `manager`**

```ts
// When registering through `manager`, you need to add the `$` prefix
import { create } from 'danmu';

const manager = create({
  plugin: {
    $hide(danmaku) {},
    $show(danmaku) {},
  },
});
```

**2. Register through danmaku instance**

If you obtain a danmaku instance in other global hooks, you can register it this way. This can be very useful when writing plugins.

```ts
danmaku.use({
  hide(danmaku) {},
  show(danmaku) {},
});
```

## `hooks.hide`

**Type: `SyncHook<[Danmaku<T>]>`**

The `hide` hook is triggered when the danmaku is hidden.

## `hooks.show`

**Type: `SyncHook<[Danmaku<T>]>`**

The `show` hook is triggered when the danmaku changes from hidden to visible.

## `hooks.pause`

**Type: `SyncHook<[Danmaku<T>]>`**

The `pause` hook is triggered when the danmaku is paused.

## `hooks.resume`

**Type: `SyncHook<[Danmaku<T>]>`**

The `resume` hook is triggered when the danmaku resumes from being paused.


## `hooks.moveStart`

**Type: `SyncHook<[Danmaku<T>]>`**

The `moveStart` hook is triggered just before the danmaku starts moving. You can make some style changes to the danmaku at this time.

## `hooks.moveEnd`

**Type: `SyncHook<[Danmaku<T>]>`**

The `moveEnd` hook is triggered when the danmaku finishes moving. Finishing the movement does not mean it will be destroyed immediately. For performance reasons, the kernel will batch collect and destroy them together.

## `hooks.appendNode`

**Type: `SyncHook<[Danmaku<T>]>`**

The `appendNode` hook is triggered when the danmaku node is added to the container. It occurs after the `createNode` hook.

## `hooks.removeNode`

**Type: `SyncHook<[Danmaku<T>]>`**

The `removeNode` hook will be triggered when the danmaku is removed from the container.

## `hooks.createNode`

**Type: `SyncHook<[Danmaku<T>]>`**

The `createNode` hook will be triggered after the built-in HTML node of the danmaku is created. You can use `danmaku.node` to get this node within this hook and **perform some styling and rendering operations on the node. This is a very important step for the extensibility of this framework **.

**Example:**

```tsx
function DanmakuComponent(props: { danmaku: Danmaku<unknown> }) {
  return <div>{props.danmaku.data.value}</div>;
}

manager.use({
  $createNode(danmaku) {
    // Render the component onto the built-in node of the danmaku
    ReactDOM.createRoot(danmaku.node).render(
      <DanmakuComponent danmaku={danmaku} />,
    );
  },
});
```

## `hooks.destroyed`

**Type: `SyncHook<[Danmaku<T>, unknown]>`**

The `destroyed` hook is triggered when the danmaku is destroyed. If you need to manually call the [**`danmaku.destroy`**](../reference/danmaku-api/#danmaku-destroy) method, you can try passing a `mark`.