# manager 方法

> [!NOTE] 单位提示
> `danmu` 所有参与计算的单位都允许通过表达式来计算，类似 CSS 的 `calc`。
>
> 1. `number`: 默认单位为 `px`。
> 2. `string`: 表达式计算。支持（`+`, `-`, `*`, `/`）数学计算，只支持 `%` 和 `px` 两种单位。
>
> ```ts
> manager.setGap('(100% - 10px) / 5');
> ```

## `manager.canPush()`

**类型：`(type: DanmakuType) => boolean`**

判断是否能够添加弹幕，超过内存限制阈值，渲染数量阈值会被阻止添加，你可以通过调用 `manager.setLimits()` 来更改。

```ts
// 判断当前能否 push 一个普通弹幕
manager.canPush('facile');

// 判断当前能否 push 一个高级弹幕
manager.canPush('flexible');
```

## `manager.push()`

**类型：`(data: T, options?: PushOptions<T>) => boolean`**

发送一条弹幕，这条弹幕会被放在内存数组中等待被渲染，这不一定是即时响应渲染的，要看你设置的渲染算法，你可以通过调用 `manager.setMode()` 来更改，会触发 `push` 钩子。

> [!NOTE] 注意
>
> 1. 发送弹幕的时候，**数据格式必须是 `T`**，至于 `T` 的类型由你自己来控制，只要你能在渲染的时候能正确拿到就可以了，具体见下面的示例。
> 2. 当第二个参数没有传递时，或者其中某些参数没有传递时，则会从 `manager.options` 里面取默认的值。

```ts
export interface PushOptions<T> {
  id?: number | string;
  rate?: number;
  duration?: number;
  plugin?: DanmakuPlugin<T>;
  direction?: 'right' | 'left';
}
```

**简单 case：**

```ts
import { create } from 'danmu';

const manager = create<string>();

// 发送一条弹幕
// 时间，速率，方向等配置复用全局的也就是 create() 时传递的参数。
manager.push('弹幕内容');
```

**完整 case：**

```ts
import { create } from 'danmu';

const manager = create<{ content: string }>();

// 发送一条弹幕并添加插件处理，插件的作用域仅限当前 push 的这一条弹幕。
manager.push(
  { content: '弹幕内容' },
  {
    id: 1, // 如果你的弹幕有 id，可以添加到这里
    rate: 1.5,
    duration: 1000,
    direction: 'left',
    plugin: {
      createNode(danmaku) {
        const div = document.createElement('div');
        div.innerHTML = danmaku.data.content; // 弹幕内容
        danmaku.node.appendChild(div);
      },
    },
  },
);
```

## `manager.unshift()`

**类型：`(data: T, options?: PushOptions<T>) => boolean`**

`push` 方法是添加到内存数组后面，此方法会将弹幕**添加到内存数组前面**，当用户在输入了一条弹幕点击发送的时候，你应该使用此方法，以便于让弹幕在下次轮询的时候**立即渲染**，用法和 `push` 方法一样，会触发 `push` 钩子。

## `manager.pushFlexibleDanmaku()`

**类型：`(data: T, options?: PushFlexOptions<T>) => boolean`**

发送一条高级弹幕，**高级弹幕会在下次轮询的时候渲染**，会触发 `push` 钩子。

> [!NOTE] 高级弹幕说明
>
> 1. 高级弹幕的 `options` 和普通弹幕的 `options` 行为一样，如果不传会默认从 `manager.options` 里面取默认值。
> 2. 高级弹幕**必须传递 `position` 来指定位置**，如果需要指定在某个轨道渲染，可以借助 [**`getTrackLocation()`**](#manager-gettracklocation) 来做到。

```ts
import { create } from 'danmu';

interface Position {
  x: number;
  y: number;
}

interface PushFlexOptions {
  id?: number | string;
  rate?: number;
  duration?: number;
  plugin?: DanmakuPlugin<T>;
  direction?: 'left' | 'right' | 'none'; // 普通弹幕没有 'none'
  position:
    | Position
    | ((danmaku: Danmaku<T>, container: Container) => Position);
}

const manager = create<string>();

// 发送一条弹幕，在容器居中的位置，静止 5s
manager.pushFlexibleDanmaku('弹幕内容', {
  duration: 5000,
  direction: 'none',
  position(danmaku, container) {
    // 也可以通过字符串表达式来设置 `50% - (${danmaku.getWidth()} / 2)`
    return {
      x: (container.width - danmaku.getWidth()) * 0.5,
      y: (container.height - danmaku.getHeight()) * 0.5,
    };
  },
});
```

## `manager.getTrackLocation()`

**类型：`(i: number) => { start: number, middle: number, end: number }`**

用来获取某条轨道的位置信息，**单位为 `px`，为 Y 轴的数据**。**`i` 如果为正整数，则是取的是 `tarck[i]` 的位置信息，如果为负正整数则从后往前取。**

> [!NOTE] 提示
> 下标默认从 **`0`** 开始，也就是你传递为 0 时，取的是第一条轨道的数据。

**示例：**

```ts
// 取第一条轨道的位置信息
const { start, middle, end } = manager.getTrackLocation(0);

// 取最后一条轨道的位置信息
const { start, middle, end } = manager.getTrackLocation(-1);
```

> [!NOTE] 提示
> 当你发送高级弹幕的时候如果需要将其发送到某条轨道上，此方法可能会很有用。普通弹幕的位置信息计算方式如下，会在轨道的居中的位置渲染，如果要保持和普通弹幕一样，或许也是一样的算法。
>
> > 1.  对于弹幕的高度，如果你不需要通过计算就可以得到，则不需要通过 `getHeight()` 方法。
> > 2.  你确保获取的轨道存在，否则会报错，可以通过 `manager.trackCount` 来判断。
> > 3.  你可以在我们的在线 [**demo**](https://imtaotao.github.io/danmu/) 打开浏览器控制台输入这段代码查看效果，

```ts {9,12}
// 发送一个高级弹幕
manager.pushFlexibleDanmaku(
  { content: '测试' },
  {
    duration: 5000,
    direction: 'none',
    position(danmaku, container) {
      // 渲染在第 4 条轨道中
      const { middle } = manager.getTrackLocation(3);
      return {
        x: (container.width - danmaku.getWidth()) * 0.5,
        y: middle - danmaku.getHeight() / 2,
      };
    },
  },
);
```

## `manager.clearTarck()`

**类型：`(i: number) => void`**

用来清除某条轨道上渲染的弹幕。**`i` 如果为正整数，则是清除 `tarck[i]` 上的弹幕，如果为负正整数则从后往前取。**

**示例：**

```ts
// 清除第一条轨道上的弹幕
manager.clearTarck(0);

// 清除最后一条轨道上的弹幕
manager.clearTarck(-1);
```

## `manager.len()`

**类型：`() => { stash: number; flexible: number; view: number; all: number }`**

返回当前渲染引擎的弹幕状态数量，这是实时变化的。

- `all` 所有弹幕的数量，包括内存区，渲染中的弹幕。
- `view` 当前正在渲染的弹幕数量，包含普通弹幕和高级弹幕。
- `stash` 当前储存在内存区的普通弹幕数量。
- `flexible` 当前高级弹幕的数量，包含正在渲染的和在内存区的。

```ts
const { stash, flexible, view, all } = manager.len();
```

## `manager.each()`

**类型：`(fn: (d: Danmaku<T>) => boolean | void) => void`**

对当前正在渲染的弹幕做**同步遍历**，回调函数返回 `false` 的时候会终止遍历。

## `manager.asyncEach()`

**类型：`(fn: (d: Danmaku<T>) => boolean | void) => Promise<void>`**

对当前正在渲染的弹幕做**异步遍历**，回调函数返回 `false` 的时候会终止遍历。

> [!NOTE] 与 `each` 的不同
> `asyncEach` 方法会做时间切片，也就是说当你渲染的弹幕过多时，在遍历的时候由于代码运行时间过长，可能会对主线程造成一定阻塞，所以当有切片之后，则可以缓解这一现象。

## `manager.mount()`

**类型：`(node?: HTMLElement | string, { clear?: boolean }) => void`**

将内核的弹幕容器挂载到一个 HTML 节点上，可以是一个 `string` 类型的 `CSS` 选择器，`clear` 参数可以用来清除之前渲染的弹幕，默认为 `true`，如果你不想清除可以传 `false`，挂载之后你可以通过 `manager.container` 拿到这个节点。

> [!NOTE] 和内核的容器节点的区分
> 内核的容器节点是所有弹幕渲染的节点，包括我们通过 `manager.setArea()` 来调整的时候也是更改的容器节点，但是容器节点**需要挂载到一个具体的 DOM 上**，所以这是他们之间的区分，容器节点的宽高都是 `100%`。

```ts
manager.mount('#root', { clear: false });
```

## `manager.unmount()`

**类型：`() => void`**

将内核的弹幕容器从当前挂载的节点中卸载，卸载之后当你通过 `manager.container` 获取时会得到 `null`。

```ts
manager.mount('#root', { clear: false });
```

## `manager.clear()`

**类型：`() => void`**

清空当前渲染和内存中的弹幕，会触发 `clear` 钩子。

## `manager.updateOptions()`

**类型：`(newOptions: Partial<ManagerOptions>) => void`**

更新 `manager.options`，如果涉及到一些间距和宽高的变化，会自动 format，会触发 `updateOptions` 钩子，你可以在这个钩子里面拿到需要更新的 `options`。

## `manager.startPlaying()`

**类型：`() => void`**

启动渲染引擎，内核会启动一个定时器轮询渲染。会触发 `start` 钩子

## `manager.stopPlaying()`

**类型：`() => void`**

关闭渲染引擎，内核的定时器也会被清除。会触发 `stop` 钩子。

## `manager.hide()`

**类型：`() => Promise<Manager>`**

将当前渲染的弹幕隐藏起来，并且新渲染的弹幕也会被隐藏。会触发 `hide` 钩子。

## `manager.show()`

**类型：`() => Promise<Manager>`**

将当前被隐藏的弹幕显示出来。会触发 `show` 钩子。

## `manager.nextFrame()`

**类型：`(fn: FrameRequestCallback) => void`**

这是一个工具方法，回调函数会在下一帧触发。

```ts
manager.nextFrame(() => {
  // .
});
```

## `manager.updateOccludedUrl()`

**类型：`(url?: string, el?: string | HTMLElement) => void`**

给指定元素（默认是当前弹幕容器 `manager.container.node`）添加蒙版，**用来实现防遮挡功能**，如果不传 `url`，代表取消蒙层，你可以通过传递第二参数指定到你需要的 DOM 节点上。

> [!NOTE] 注意事项
> 放遮挡功能需要你不停的调用 `manager.updateOccludedUrl('url')` 来实现蒙层的更新，蒙层照片一般基于业务后端返回（可能是通过 AI 技术来计算当前视频需要防遮挡的区域，实际情况还是要根据业务情况来实现）。

## `manager.render()`

**类型：`() => void`**

跳过等到下次轮询，立即进行渲染，如果你发送了一个弹幕，不想等待下次轮询，想立即渲染，则可以使用此方法。

```ts
manager.unshift('弹幕内容');

// 立即渲染
manager.render();
```

## `manager.remove()`

**类型：`(pluginName: string) => void`**

移除当前 `manager` 实例的某个插件，但是必须指定插件名字。

## `manager.use()`

**类型：`(plugin: ManagerPlugin<T> | ((m: this) => ManagerPlugin<T>)) => ManagerPlugin<T> & { name: string }`**

给当前 `manager` 实例注册一个插件，返回插件实例，如果你在后续需要移除插件，可以保存插件的 `name`，如果不传会默认分别一个 `uuid` 形式的 `name`。

**如果传递了 `name`：**

```ts
const plugin = manager.use({
  name: 'test-plugin',
  // .
});
console.log(plugin.name); // 'test-plugin'
```

**如果不传 `name`：**

```ts
const plugin = manager.use({
  // .
});
console.log(plugin.name); // uuid
```

## `manager.isShow()`

**类型：`() => boolean`**

用来判断当前弹幕是否是在 `显示` 状态，通常当你调用 `manager.show()` 之后，调用此方法将会返回 `true`;

## `manager.isFreeze()`

**类型：`() => boolean`**

用来判断当前弹幕是否是在 `冻结` 状态，通常当你调用 `manager.freeze()` 之后，调用此方法将会返回 `true`;

## `manager.isPlaying()`

**类型：`() => boolean`**

用来判断当前渲染引擎是否正在渲染播放状态，当你调用 `manager.stopPlaying()` 后，会返回 `false`。

## `manager.isDanmaku()`

**类型：`(b: unknown) => b is Danmaku<T>`**

用来判断某个值是否是弹幕实例。

## `manager.setArea()`

**类型：`(data: AreaOptions) => void`**

设置当前容器（`manager.container.node`）的大小，会自动 format，使用方法可以参见 [**demo**](https://github.com/imtaotao/danmu/blob/master/demo/src/components/sidebar/SidebarAreaY.tsx#L26-L31)。

```ts
interface AreaOptions {
  x?: {
    start?: string | number;
    end?: string | number;
  };
  y?: {
    start?: string | number;
    end?: string | number;
  };
}
```

## `manager.setOpacity()`

**类型：`(opacity: number | string) => void`**

设置当前弹幕和后续渲染的弹幕的**透明度**，如果参数是 `string`，会默认转为 `number`。

## `manager.setStyle()`

**类型：`(key: StyleKey, val: CSSStyleDeclaration[StyleKey]) => void`**

设置当前弹幕和后续渲染的弹幕的 **CSS 样式**。

## `manager.setRate()`

**类型：`(rate: number) => void`**

设置后续渲染的弹幕**速率**，是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

## `manager.setMode()`

**类型：`(mode: 'none' | 'strict' | 'adaptive') => void`**

设置后续渲染的弹幕的**碰撞检测算法**，是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

## `manager.setGap()`

**类型：`(gap: number | string) => void`**

设置后续渲染的弹幕之间的**横向间距**，是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

## `manager.setTimes()`

**类型：`(times: [number, number]) => void`**

设置后续渲染的弹幕之间的**运动时间取值范围**，是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

## `manager.setLimits()`

**类型：`(limits: { view?: number; stash?: number }) => void`**

设置**要限制的内存区和渲染区域弹幕数量**，默认的 `stash` 数量是 `1024`，如果超过会在控制台发出警告，你可以设置为一个新的值来灵活调整。 是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

## `manager.setInterval()`

**类型：`(interval: number) => void`**

设置渲染引擎的**轮询时间**，是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

## `manager.setDirection()`

**类型：`(direction: 'left' | 'right') => void`**

设置后续渲染的**方向**，是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

## `manager.setTrackHeight()`

**类型：`(trackHeight: number | string) => void`**

设置**轨道高度**。是 `manager.updateOptions()` 的语法糖，会触发 `updateOptions` 钩子。

> [!NOTE] 轨道高度的设置规则
> 轨道高度一般要设置为**大于等于弹幕高度**，否则会有弹幕上下重叠的情况出现。

```ts
// 这只会存在三条轨道
manager.setTrackHeight('33%');

// 轨道高度为 100px，轨道的数目为 `容器高度 / 100px`
manager.setTrackHeight(100);
```
