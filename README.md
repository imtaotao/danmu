## Description
[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@rustle/danmuku.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@rustle/danmuku

这是一个弹幕库，使用 `dom + css3` 的方式构建。[Demo](https://imtaotao.github.io/danmuku)

## Installation
`$ npm install @rustle/danmuku`<br>
```html
<script src="https://cdn.jsdelivr.net/gh/imtaotao/Danmuku/dist/danmuku.min.js"></script>
```

## [BarrageManager API 详细介绍](https://github.com/imtaotao/danmuku/blob/master/docs/manager-api.md)

## [Barrage API 详细介绍](https://github.com/imtaotao/danmuku/blob/master/docs/barrage-api.md)

## API 预览
### 全局 api
  + `create(opts: Options) : barrageManager`

```js
  // 这将创建一个弹幕 manager，用于管理弹幕
  const manager = Danmuku.create({})
```

### barrageManager
属性
  + `runing: boolean`：  是否正在运行中
  + `length: number`：  总弹幕数量，包括未渲染和已经渲染的
  + `specialLength: number`： 特殊弹幕数量
  + `showLength: number`：  已经渲染的弹幕数量
  + `stashLength: number`： 暂存在内存中还没有渲染的弹幕数量
  + `containerWidth: number`：  容器宽度
  + `containerHeight: number`： 容器高度

API
  + `send(barrageData: any | Array<any>) : boolean`
  + `sendSpecial(specialBarrageData: any | Array<any>) : boolean`
  + `show() : void`
  + `hidden() : void`
  + `each(cb: Function) : void`
  + `start() : void`
  + `stop() : void`
  + `setOptions(option: Options) : void`
  + `resize() : void`
  + `clear() : void`
  + `clone(option?: Options) : barrageManager`

### Barrage
属性
  + `node: number`： 弹幕的 `HTMLElement` 元素
  + `paused: boolean`：  弹幕是否在暂停中
  + `duration : number`：  弹幕渲染停留时长
  + `key: string`： 唯一标识符
  + `isSpecial: boolean`： 是否是特殊弹幕
  + `data: any`：  send 时传入的数据

API
  + `getWidth() : number`
  + `getHeight() : number`
  + `destory() : void`
  + `pause() : void`
  + `resume() : void`

## 配置项
### barrageManager Options 预览
创建弹幕 manager 的参数 
  + `limit: number`：  页面上允许渲染的弹幕数量。默认为 `100`
  + `height: number`：  轨道的高。默认为 `50`
  + `rowGap: number`：同一条轨道上两条弹幕的起始间隔，如果小于等于 0，将使弹幕不进行碰撞检测计算。默认为 `50`
  + `isShow: boolean`：默认是否显示。默认为 `true`
  + `capacity: number`：内存中能存放的弹幕数量，超过这个数量，`send` 方法将返回 `false`。默认为 `1024`
  + `times: Array<number>`： 弹幕移动时间取值的范围。默认为 `1024`
  + `interval: number`：  渲染频率。默认为 `2`s
  + `direction: 'left' | 'right'`：弹幕移动方向。默认为 `right`
  + `hooks: Object`：钩子函数，下面会详细介绍。默认为 `{}`

#### options.hooks
通过定义钩子，能够参与到整个弹幕的创建，渲染和销毁等过程，完全能够自定义样式的样式和行为，这是整个弹幕库强大的扩展性的来源<br>
所有与单个弹幕相关的钩子都以 `barrage` 开头，下面的钩子函数出现的先后顺序也是**执行顺序**，也就是说 `barrageCreate`最先执行，`barrageDestroy` 最后执行。如果是特殊弹幕的创建，还会调用自身的钩子，在后面的内容会介绍<br>
而 `manager` 的钩子没有先后顺序之分
  + `barrageCreate(barrage: Barrage, node: HTMLElement)`
  + `barrageAppend(barrage: Barrage, node: HTMLElement)`
  + `barrageMove(barrage: Barrage, node: HTMLElement)`
  + `barrageRemove(barrage: Barrage, node: HTMLElement)`
  + `barrageDestroy(barrage: Barrage, node: HTMLElement)`

  + `send(manager: barrageManager, data: any)`
  + `sendSpecial(manager: barrageManager, data: any)`
  + `show(manager: barrageManager)`
  + `hidden(manager: barrageManager)`
  + `start(manager: barrageManager)`
  + `stop(manager: barrageManager)`
  + `resize(manager: barrageManager)`
  + `clear(manager: barrageManager)`
  + `setOptions(manager: barrageManager, options: Options)`
  + `render(manager: barrageManager)`
  + `ended(manager: barrageManager)`

### 特殊弹幕 Options 预览
  + `hooks: Object`： 特殊弹幕创建的钩子。默认为 `{}`
  + `duration: number`： 特殊弹幕的渲染时长。默认为 `0`
  + `direction: 'left' | 'right' | 'none'`： 特殊弹幕的移动方向，为 `none` 时，弹幕将不会移动。默认为 `none`
  + `position: (barrage: Barrage) => ({x: number, y: number })`：  特殊弹幕的位置信息，必须是一个函数，返回一个带有 `x` 和 `y` 的对象

## 两种模式
  + 如果指定了 `rowGap`，`danmuku` 默认会进行碰撞检测。这将导致弹幕的发送不是实时。弹幕会在一个合适的时机进行渲染。这是默认的模式，避免了弹幕重叠和渲染数量过多导致的用户体验变差和内存 cpu 压力过大。但是有时候我们是需要实时响应弹幕
  + 将 rowGap 设置为一个小于等于的 0 的数将会取消掉上述的碰撞检测计算。这会让弹幕实时出现。但是你如果设置了 `limit`，还是会受到限制，所有你需要把 `limit` 设置为 `Infinity` 取消限制，这就是实时响应模式

```js
  // 自己封装一个方法
  function realTimeResponse () {
    const { limit, rowGap } = manager.opts
    manager.setOptions({
      rowGap: 0,
      limit: Infinity,
    })

    // return 一个切换回去的函数
    return () => manager.setOptions({ limit, rowGap })
  }
```

## 注意事项
由于本弹幕库使用 css 进行动画操作，所以弹幕的 `style` 属性值有些被占用，除非你很了解他们，否则不应该使用这些 style。以下 css style 被占用

  + `style.left`
  + `style.right`
  + `style.opacity`
  + `style.display`
  + `style.position`
  + `style.transform`
  + `style.transition`
  + `style.visibility`
  + `style.pointerEvents`
  + `style.transitionDuration`

如果 `conatainer` 的 `position` 没有被设置或者为 `static`，那么 `container` 的 `position` 将会被设置为 `relative`

有问题或者需要讨论，欢迎加入前端小分队 QQ 群：`624921236`