# 弹幕方法

弹幕实例有一些方法供你使用，你可用用他们来做一些行为，或者获取当前弹幕的一些状态数据。下面是一个示例：

```tsx {6,9,17-19}
// 点击弹幕的时候会销毁弹幕
function DanmakuComponent(props: { danmaku: Danmaku<unknown> }) {
  return (
    <div
      onClick={() => {
        props.danmaku.destroy();
      }}
    >
      {props.danmaku.data.value}
    </div>
  );
}

// 将组件渲染到弹幕的内置节点上
manager.use({
  $createNode(danmaku) {
    ReactDOM.createRoot(danmaku.node).render(
      <DanmakuComponent danmaku={danmaku} />,
    );
  },
});
```

## `danmaku.hide()`

**类型：`() => void`**

将当前弹幕实例设置为隐藏状态，实际上是设置 `visibility: hidden`，会调用 `hide` 钩子。

## `danmaku.show()`

**类型：`() => void`**

将当前弹幕实例从隐藏状态恢复显示，会调用 `show` 钩子。

## `danmaku.pause()`

**类型：`() => void`**

将当前正在运动状态的弹幕实例暂停，会调用 `pause` 钩子。

## `danmaku.resume()`

**类型：`() => void`**

将当前正在暂停状态的弹幕实例恢复运动，会调用 `resume` 钩子。

## `danmaku.setloop()`

**类型：`() => void`**

将弹幕实例设置为循环播放状态。

## `danmaku.unloop()`

**类型：`() => void`**

将弹幕实例从循环播放状态取消。

## `danmaku.destroy()`

**类型：`(mark?: unknown) => void`**

将当前弹幕实例从容器中销毁，并从内存中移除，会调用 `destroy` 钩子，你也可以尝试传递 `mark` 标识符，引擎内置的 destroy 行为是不会传递标识符的。

```ts {4,8}
const manager = create({
  plugin: {
    $moveEnd(danmaku) {
      danmaku.destroy('mark');
    },

    $destroyed(danmaku, mark) {
      if (mark === 'mark') {
        // .
      }
    },
  },
});
```

## `danmaku.setStyle()`

**类型：`(key: StyleKey, val: CSSStyleDeclaration[StyleKey]) => void`**

设置当前弹幕实例内置节点的 `CSS` 样式。

```ts
// 将内置弹幕节点的背景色改为红色
danmaku.setStyle('background', 'red');
```

## `danmaku.getWidth()`

**类型：`() => number`**

`getWidth()` 将返回弹幕实例自身的宽度，同样的在你发送高级弹幕的时候会很有用。

## `danmaku.getHeight()`

**类型：`() => number`**

`getHeight()` 将返回弹幕实例自身的高度，这在你发送高级弹幕的时候计算 `position` 的时候会很有用。

## `danmaku.updateDuration()`

**类型：`(duration: number) => void`**

`updateDuration()` 用于更新弹幕实例的运动时间，一般情况下这个方法供内部的渲染引擎使用。

## `danmaku.remove()`

**类型：`(pluginName: string) => void`**

移除当前弹幕实例的某个插件，但是必须指定插件名字。

## `danmaku.use()`

**类型：`(plugin: DanmakuPlugin<T> | ((d: this) => DanmakuPlugin<T>)) => DanmakuPlugin<T>`**

给当前弹幕实例注册一个插件，返回插件实例，如果你在后续需要移除插件，可以保存插件的 `name`，如果不传会默认分别一个 `uuid` 形式的 `name`。

**如果传了 `name`：**

```ts
const plugin = danmaku.use({
  name: 'test-plugin',
  // .
});
console.log(plugin.name); // 'test-plugin'
```

**如果不传 `name`：**

```ts
const plugin = danmaku.use({
  // .
});
console.log(plugin.name); // uuid
```
