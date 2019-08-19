## Description
这是一个弹幕库，使用 `dom + css3` 的方式构建

## Demo
[demo地址](https://imtaotao.github.io/danmuku)，实时查看 fps 和 内存占用
  1. 打开 `Chrome DevTools`
  2. `ctrl + shift + p` 或者 `command + shift + p`
  3. 输入 `Show rendering`
  4. 勾选 `FPS meter`

## API 预览
### 全局 api
  + `create(opts: Options) : barrageManager`

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
  + `setOptions(opts: Options) : void`
  + `resize() : void`
  + `clear() : void`
  + `clone(opts?: Options) : barrageManager`

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
通过定义钩子，能够参与到整个弹幕的创建，渲染和销毁等过程，完全能够自定义样式的样式和行为，这是整个弹幕库强大的扩展性的来源。
所有与单个弹幕相关的钩子都以 `barrage` 开头，下面的钩子函数出现的先后顺序也是**执行顺序**，也就是说 `barrageCreate`最先，`barrageDestroy` 最后执行。如果是特殊弹幕的创建，还会调用自身的钩子，在后面的内容会介绍
  + `barrageCreate(barrage: Barrage, node: HTMLElement)`
  + `barrageAppend(barrage: Barrage, node: HTMLElement)`
  + `barrageRemove(barrage: Barrage, node: HTMLElement)`
  + `barrageDestroy(barrage: Barrage, node: HTMLElement)`

barrage 相关的钩子函数，下面的钩子没有先后顺序之分
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
  + `position: (barrage: Barrage) => ({x: number, y: number })`：  特殊弹幕的位置信息，必须是一个函数，返回一个带有 `x` 和 `y` 的对，你可以通过 barrage 的api 来计算位置信息，例如以下 demo。默认都是返回 `0`

demo
```js
  // 这将使得整个特殊弹幕出现在容器居中的位置，而且弹幕的背景色为红色
  manager.sendSpecial({
    duration: 5,
    direction: 'right',
    position (barrage) {
      return {
        x: (manager.containerWidth - barrage.getWidth()) / 2,
        y: (manager.containerHeight- barrage.getHeight()) / 2 
      }
    },
    hooks: {
      create (barrage) {
        barrage.node.style.background = 'red'
      }
    }
  })
```