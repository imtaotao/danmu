# manager 配置

在初始化 `manager` 的时候，允许传递全局 options，替换默认的配置。以下所有的配置都是**可选的**。

> [!NOTE] 注意
> 这里的是全局属性，在发送弹幕的时候如果一些可选属性没有传递，**会默认取这里的全局属性**。

**示例：**

```ts {16}
interface CreateOption {
  rate?: number;
  interval?: number;
  gap?: number | string;
  durationRange?: [number, number];
  trackHeight?: number | string;
  plugin?: ManagerPlugin;
  limits?: {
    view?: number;
    stash?: number;
  };
  direction?: 'right' | 'left';
  mode?: 'none' | 'strict' | 'adaptive';
}

export declare function create(options?: CreateOption): Manager;
```

除了 `plugin`，所有的参数都可以通过在**创建 `manager` 的时候设置**或者**通过 api 来更改**。

**示例：**

```ts
import { create } from 'danmu';

// 1. 在初始化的时候设置
const manager = create({ rate: 1 });

// 2. 通过 api 来更改
manager.setRate(1);
```

## `config.mode`

**类型：`'none' | 'strict' | 'adaptive'`**<br/>
**默认值：`'strict'`**

用来确定内核的**碰撞检测算法**。**如果你的业务场景是直播或者视频播放，你应该设置为 `adaptive`，这样在满足实时渲染的前提下，尽可能的不发生弹幕碰撞。**

- **`none`** 不会有任何碰撞检测，弹幕会立即渲染。
- **`strict`** 会进行严格的碰撞检测，如果不满足条件则会推迟渲染。
- **`adaptive`** 在满足立即渲染的前提下，会尽力进行碰撞检测（推荐）。

## `config.rate`

**类型：`number`**<br/>
**默认值：`1`**

用来设置设置弹幕的运动速率，弹幕的原始运动速度会乘以 `rate` 这个系数。

## `config.gap`

**类型：`number | string`**<br/>
**默认值：`0`**

同一条轨道在碰撞检测的啥情况下，后一条弹幕与前一条弹幕最小相隔的距离。**不能设置一个小于 `0` 的值，如果传递的是 `string` 类型则代表是百分比，但是必须是 `10%` 这种语法**， 仅当弹幕命中了碰撞检测的时候才会生效。

**示例：**

```ts
manager.setGap(100); // 最小间距为 100px
manager.setGap('10%'); // 最小间距为容器宽度的 10%
```

## `config.interval`

**类型：`number`**<br/>
**默认值：`500`**

内核轮询渲染的频率，默认为 `500ms` 一次，你可以根据业务现实情况调整为一个合适的值。其实就是 `setTimeout` 的时间。

## `config.direction`

**类型：`string`**<br/>
**默认值：`'right'`**

弹幕的运动方向，默认从右往左运动，**普通弹幕没有 `none` 值，高级弹幕可以设置 `none` 值**。如果发送弹幕的时候有自己的 `direction`，则会取弹幕自身的配置。

## `config.trackHeight`

**类型：`number | string`**<br/>
**默认值：`'20%'`**

轨道高度，如果传入的值为 `number` 类型，则默认是 `px`，如果传递是 `string` 类型，必须是 `10%` 这种语法，代表基于容器的百分比高度。

**示例：**

```ts
manager.setTrackHeight(100); // 高度为 100px
manager.setTrackHeight('33%'); // 高度为容器高度的 33%
```

## `config.durationRange`

**类型：`[number, number]`**<br/>
**默认值：`[4000, 6000]`**

普通弹幕的运动时间，这是一个范围值，**普通弹幕会在这个范围内随机选择一个时间作为运动时间**，如果你希望所有的弹幕运动时间都一致，你可以将两个数设置为同样的数。如果发送弹幕的时候有自己的 `duration`，则会取弹幕自身的配置。

## `config.limits`

**类型：`{ view?: number; stash?: number }`**<br/>
**默认值：`{ stash: Infinity }`**

> [!NOTE] 提示
> 这个参数会限制弹幕渲染的数量，内存和视图的**默认值都是不限制**。

- `view` 限制渲染在容器中的弹幕数量，如果超过了此限制，普通弹幕会放在内存中，等待合适的时机渲染，高级弹幕会直接丢弃。
- `stash` 限制存放在内存中的弹幕数量，如果超过此限制则会被丢弃，并触发告警或调用插件钩子，你可以适当调整此参数。

## `config.plugin`

**类型：`ManagerPlugin<unknown> | Array<ManagerPlugin<unknown>>`**<br/>
**默认值：`undefined`**

创建 `manager` 的时候默认的 `managerPlugin`，如果你需要注册新插件可以使用 `manager.use` 方法。详情可见 [**manager 钩子**](./manager-hooks) 和 [**编写插件**](../guide/create-plugin) 这两章。

**示例：**

```ts
import { create } from 'danmu';

const manager = create({
  plugin: {
    // .
    start() {},
    stop() {},
  },
});
```

**以数组类型传递：**

```ts
// 你也可以传递为一个数组，方便你添加其他插件时控制顺序
const manager = create({
  plugin: [
    // .
    {
      // .
      start() {},
      stop() {},
    },
  ],
});
```
