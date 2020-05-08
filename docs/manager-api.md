## 以下是 BarrageManager 类的相关 API 和 Options 介绍
  + 以下弹幕实例统一使用 `barrage` 
  + 以下 BarrageManager 统一使用 `manager`

## 属性
### `runing: boolean`
`runing` 属性标记当前 manager 是否正在渲染中。你可以用他来判断当前的运行状态，并做一些其他的事情
```js
  // 如果正在运行中就暂停，否则就启动
  manager.runing
    ? manager.stop()
    : manager.start()
```

### `length: number`
`length` 属性记录着当前所有的弹幕数量，包括还未渲染的弹幕，已经渲染在容器上的弹幕，和特殊弹幕
```js
  // 如果当前弹幕数量到达一定数量，去做一些其他的事情
  if (manager.length > 1000) {
    ...
  }
```

### `specialLength: number`
`specialLength` 属性记录着当前特殊弹幕的数量
```js
  console.log(manager.specialLength)
```

### `showLength: number`
`showLength` 属性记录这个当前渲染在容器中的弹幕数量
```js
  // 每渲染一次，就打印一次现在容器中渲染的弹幕数量
  setInterval(() => {
    console.log(managere.showLength)
  }, manager.opts.interval)
```

### `stashLength: number`
`stashLength` 属性记录着当前还未渲染的弹幕数量，但是不包括特殊弹幕，意思是这个属性等于 `managere.length - manager.showLength - managere.specialLength`
```js
   // 每渲染一次，就打印一次还为渲染的普通弹幕数量
  setInterval(() => {
    console.log(managere.stashLength)
  }, manager.opts.interval)
```

### `containerWidth: number` 和 `containerHeight: number`
`containerWidth` 属性记录着当前容器的宽度，它是动态的，当调用 `manager.resize` 方法的时候，`containerWidth` 也将随之变化。你可能会在发送特殊弹幕的时候用到他
```js
  console.log(manager.containerWidth)
  console.log(manager.containerHeight)
```

## API
### `send(barrageData: any | Array<any>, hooks?: Hooks, isForward?: boolean) : boolean`
`send` 方法将发送一个普通弹幕或者一批普通弹幕，所以如果传入的是一个数组，他将判断是多个弹幕。send 方法将不会去检测传入的参数，所以即使传入的为 `undefined`，他同样将创建一个弹幕。当发送弹幕失败时，他将返回 `false`，同样的，发送成功将返回 `true`。send 方法调用时传入的参数将保持在弹幕实例中，你可以通过 `barrage.data` 拿到他。`send` 方法调用时会同步触发 `send` 钩子<br>
第二个参数为 hooks，为当前弹幕的 hooks，如果是一个数组则是多个弹幕共用一套<br>
第三个参数为 isForward, 如果为 true 将从头入栈，优先渲染
```js
  // 这将发送三个普通弹幕，他会在合适的时机渲染到容器中
  const manager = Danmuku.create({
    hooks: {
      send (manager, data) {
        console.log(data)
      },
  
      barrageCreate (barrage, node) {
        if (!barrage.isSpecial) {
          console.log(barrage.data) // -> { content: 'one' }
          // 设置弹幕内容和样式
          node.textContent = barrage.data.content
          node.classList.add('barrage-style')
        }
      }
    }
  })

  manager.send({ content: 'one' })
  manager.send([
    { content: 'two' },
    { content: 'two' },
  ])
```


### `sendSpecial(specialBarrageData: any | Array<any>) : boolean`
`sendSpecial` 方法用于发送特殊弹幕。特殊弹幕的特性与差异，请看[这里](https://github.com/imtaotao/danmuku/blob/master/docs/barrage-api.md#%E7%89%B9%E6%AE%8A%E5%BC%B9%E5%B9%95%E7%9A%84-options)。`sendSpecial` 与 `send` 很相似，他同样接受一个或多个弹幕，返回一个 `boolean` 值标识是否发送成功。唯一不同的是，他将不参与碰撞计算，所以如果容器的渲染数量没有到达临界值，他将立即渲染在视图上。`sendSpecial` 方法调用时会同步触发 `sendSpecial` 钩子
```js
  // 下面将发送一个特殊的弹幕，渲染在左上角
  // 最后会先打印 1，再打印 2，这也代表弹幕自身的 hook 先于 manager 的 hook 执行
  const manager = Danmuku.create({
    hooks: {
      sendSpecial (manager, data) {
        console.log(data)
      },
  
      barrageCreate (barrage, node) {
        if (barrage.isSpecial) {
          console.log(2)
        }
      }
    }
  })

  // options 的介绍请看 barrage 相关介绍
  manager.sendSpecial({
    data: 'chentao',
    direction: 'none',
    diration: 5,
    position (barrage) {
      // 位置信息最后将通过作用于 node 的 css 样式生效，单位将统一设置为 px
      return { x: 0, y: 0 }
    },
    hooks: {
      create (barrage, node) {
        console.log(1)
        console.log(barrage.data) // -> 'chentao'
        // 设置弹幕内容和样式
        node.textContent = barrage.data
        node.classList.add('barrage-style')
      }
    }
  })
```

### `each(cb: Function) : void`
`each` 方法将遍历所有渲染在容器中的弹幕。这允许你对所有渲染中的弹幕（包括特殊弹幕）进行操作。下面的 `show` 和 `hidden` 方法都是使用的此方法
```js
  manager.each(barrage => {
    if (barrage.isSpecial) {
      ...
    } else {
      ...
    }
  })
```

### `hidden() : void`
`hidden` 方法将隐藏所有渲染的视图弹幕，并将接下来渲染的弹幕也隐藏。他作用于普遍弹幕和特殊弹幕。他将调用弹幕的 `hidden` 和 全局 `hidden` 钩子
```js
  manager.hidden()
```

### `show() : void`
`show` 方法将显示所有的渲染视图弹幕，同上。他将调用弹幕的 `show` 和 全局 `show` 钩子
```js
  manager.show()
```

### `start() : void`
`start` 方法将开始轮询的从缓存的弹幕池中获取一部分弹幕，渲染在视图上。默认是开启的，也可以用于恢复暂停了的 `manager`。他将调用 `start` 钩子
```js
  manager.start()
```

### `stop() : void`
`stop` 方法将停止 `manager` 的轮询，不会再从缓存区获取弹幕渲染。他将调用 `stop` 钩子
```js
  manager.stop()
```

### `setOptions(option: Options) : void`
`setOptions` 方法将充值 manager 的 options。他将调用 `setOptions` 钩子
```js
  // 扩展内存区的大小，并充值弹幕渲染时间取值范围和轨道高度
  manager.setOptions({
    height: 20,
    times: [2, 10]
    capacity: 1000,
  })
```

### `resize() : void`
`resize` 方法将重新计算容器轨道。他适用于容器缩放时或者轨道高度变化时，重置 `manager` 内部的计算参数。例如用来做半屏。他将调用 `resize` 钩子
```js
  const container = document.getElementById('container')
  container.style.height = '50%'

  manager.resize()
```

### `clear() : void`
`clear` 方法将清空所有在视图中渲染的弹幕（包括特殊弹幕）和缓存区的弹幕。并停止 `manager` 的轮询渲染。这将会很好的缓解内存压力。他将调用 `stop` 和 `clear` 钩子
```js
  // 这将会清空所有弹幕，然后重新开始
  manager.clear()
  manager.start()
```

### `clone(option?: Options) : barrageManager`
`clone` 方法将复制当前 `manager` 的参数，返回一个全新的 `manager`。如果传入了 `option`，他将会与当前实例的 `option` 进行合并
```js
  const newManager = manager.clone()
```

### `use(plugin: (...args: any) => any, ...args) : ReturnType<typeof plugin>`
`use` 方法用于添加插件
```js
function plugin(opts) {
  console.log(opts) // { a: 1 }
  return 'plugin'
}
const pm = manager.use(plugin, { a: 1 })
console.log(pm) // 'plugin'
```


## Options
### `limit: number`
`limit` 将限制容器实时渲染的最大数量。如果当前容器视图中渲染的数量已经达到此配置设置的数，将不会有新的弹幕进行渲染，直到有渲染中的弹幕销毁了。默认值为 100

### `height: number`
`height` 属性为轨道的高度，普通弹幕的将会随机出现在一条轨道上。轨道数目为 `containerHeight / height`

### `rowGap: number`
`rowGap` 为同一轨道相邻两个弹幕的间距，只有前一个弹幕的移动距离大于这个值，当前轨道的下一个弹幕才被允许出现，但不代表两个相邻的弹幕永远都处于这个间距，他们的间距依赖于他们运动的时间。如果 `rowGap` 是一个大于 0 的值，同一个轨道相邻弹幕将进行碰撞计算，即使速度不一样，他们也不会再容器视图区域进行碰撞（由于是基于 css 动画，所以可能会有一点点的误差）。默认值为 50

  + 如果 rowGap 为 20
  + 前一个弹幕移动 10
  + 下一个弹幕将不会出现
  

### `isShow: boolean`
`isShow` 设置是否默认显示。默认为 true

### `capacity: number`
`capacity` 限制了缓存区能够缓存的弹幕数量，如果大于这个数，`manager.send` 和 `manager.sendSpecial` 方法将不能够发送弹幕（返回 false）。默认 1024

### `times: Array<number>`
`times` 设置了普通弹幕的渲染时间范围。普通弹幕出现的时间将会从 `times` 区间内随机取一个值。默认为 `[5, 10]`

### `interval: number`
`interval` 设置了 manager 的渲染频率，单位为 s。如果过快，将会加大 cup 的计算压力。默认为 `2`s

### `direction: 'left' | 'right'`
`direction` 设置了普遍弹幕的移动方向，规定了弹幕是从左边出来还是右边出来，默认为 `right`

### `hooks: Object`
`hooks` 为钩子函数的集合。默认为 `{}`

## Hooks
### `barrageCreate(barrage: Barrage, node: HTMLElement)`
`barrageCreate` 将在弹幕（普通和特殊）的 `HTMLElement` 创建之后调用，你可以在此对弹幕进行自定义
```js
  Danmuku.create({
    hooks: {
      barrageCreate (barrage, node) {
        // 对弹幕进行一些自定义的行为
        ...
      }
    }
  })
```

### `barrageAppend(barrage: Barrage, node: HTMLElement)`
`barrageCreate` 将在弹幕（普通和特殊）的 `HTMLElement` 添加到视图之后调用

### `barrageMove(barrage: Barrage, node: HTMLElement)`
`barrageCreate` 将在弹幕（普通和特殊）的 `HTMLElement` 开始移动时调用

### `barrageRemove(barrage: Barrage, node: HTMLElement)`
`barrageRemove` 将在弹幕（普通和特殊）的 `HTMLElement` 从视图中删除之后调用

### `barrageDestroy(barrage: Barrage, node: HTMLElement)`
`barrageRemove` 将在弹幕（普通和特殊）销毁时调用。调用 `barrage.destroy` 也会触发此钩子

### `send(manager: barrageManager, data: any)`
`send` 钩子将在 `manager.send` 调用时触发

### `sendSpecial(manager: barrageManager, data: any)`
`sendSpecial` 钩子将在 `manager.sendSpecial` 调用时触发

### `show(manager: barrageManager)`
`show` 钩子将在 `manager.show` 调用时触发

### `hidden(manager: barrageManager)`
`hidden` 钩子将在 `manager.hidden` 调用时触发

### `start(manager: barrageManager)`
`start` 钩子将在 `manager.start` 调用时触发

### `stop(manager: barrageManager)`
`stop` 钩子将在 `manager.stop` 调用时触发

### `resize(manager: barrageManager)`
`resize` 钩子将在 `manager.resize` 调用时触发

### `clear(manager: barrageManager)`
`clear` 钩子将在 `manager.clear` 调用时触发

### `setOptions(manager: barrageManager, options: Options)`
`setOptions` 钩子将在 `manager.setOptions` 调用时触发

### `willRender(manager: barrageManager, barrage | barrageData, isSpecial: boolean) : boolean | void`
`willRender` 钩子将在 `manager` 每次渲染之前（包括特殊弹幕）触发，`return false` 将会阻止当前这条弹幕渲染

### `render(manager: barrageManager)`
`render` 钩子将在 `manager` 每次渲染的时候触发（特殊弹幕的渲染将不会触发）

### `capacityWarning(manager: barrageManager)`
`capacityWarning` 将在弹幕数量超过 `barrageManager.opts.capacity` 时触发

### `ended(manager: barrageManager)`
如果发现 `manager.length` 等于 0 的时候，将会调用此钩子。但是不保证 `manager.length` 永远为 0。所以 `ended` 钩子将会有可能被多次调用