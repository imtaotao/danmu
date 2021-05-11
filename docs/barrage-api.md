## 以下是 Barrage 类的相关 API 和 Options 介绍
  + 以下弹幕实例统一使用 `barrage` 
  + 以下 BarrageManager 统一使用 `manager`

## 属性
  + `node: number`： 弹幕的 `HTMLElement` 元素
  + `paused: boolean`：  弹幕是否在暂停中
  + `duration : number`：  弹幕渲染停留时长
  + `key: string`： 唯一标识符
  + `isSpecial: boolean`： 是否是特殊弹幕
  + `isChangeDuration: boolean`： 这个属性普通弹幕才有，判断当前弹幕是否被修正过渲染时长
  + `data: any`：  `send` 或 `sendSpecial` 调用时传入的数据

### data
  + data 具有特殊性，如果是普通弹幕，data 属性就是你传入的 option，manager 不会做任何更改
  + 如果是特殊弹幕，data 属性为 option.data

## API
### `getWidth() : number`
`getWidth` 方法将会返回当前弹幕的元素的宽度

### `getHeight() : number`
`getHeight` 方法将会返回当前弹幕的元素的高度

### `destory() : void`
`destory` 方法将会销毁当前弹幕，会立即从视图和内存中删除

### `pause() : void`
`pause` 方法暂定当前弹幕的移动

### `resume() : void`
`resume` 方法恢复当前弹幕的移动

demo
```js
  // 所有的弹幕鼠标进入暂停，移除继续移动，点击销毁
  Danmuku.create({
    hooks: {
      barrageApeed (barrage, node) {
        node.onmouseenter = e => barrage.pause()
        node.onmouseleave = e => barrage.resume()
        node.onclick = e => barrage.destroy()
      }
    }
  })
```

## 特殊弹幕的 Options
特殊弹幕与普通弹幕的区别在于，特殊弹幕允许自定义弹幕的位置和渲染时长。由于可以自定义弹幕位置，导致特殊弹幕将不参与碰撞检测计算。这意味着**特殊弹幕会相互重叠和与普通弹幕重叠**。如果需要碰撞检测，则需要开发者自己手动计算。

特殊弹幕出现的初衷是允许开发者高度自定义弹幕，由于普通弹幕已经足够灵活和强大，所以特殊弹幕的很多计算与限制都被取消了。而且特殊弹幕只能是实时响应（发送后，如果页面渲染数量在 `manager` 的 `limit` 允许的范围内，则会立即渲染）

  + `hooks: Object`： 特殊弹幕创建的钩子。默认为 `{}`
  + `duration: number`： 特殊弹幕的渲染时长，时间为 0 将不会被渲染。默认为 `0`
  + `direction: 'left' | 'right' | 'none'`： 特殊弹幕的移动方向，为 `none` 时，弹幕将不会移动。默认为 `none`
  + `position: (barrage: Barrage) => ({x: number, y: number })`：  特殊弹幕的位置信息，必须是一个函数，返回一个带有 `x` 和 `y` 的对象，默认都是返回 `0`。你可以通过 `barrage` 的 `api` 来计算位置信息，例如以下 demo

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

### 弹幕的 hooks
弹幕有自己的 hooks，这与 manager 的 hooks 并不冲突，而且弹幕的 hooks 的优先级比 manager 的 hooks 高（优先调用）。

普通弹幕
```js
  manager.send({ content: 'one' }, {
    create (barrage, node) {
      if (!barrage.isSpecial) {
        console.log(barrage.data) // -> { content: 'one' }
        // 设置弹幕内容和样式
        node.textContent = barrage.data.content
        node.classList.add('barrage-style')
      }
    },
    append (barrage, node) {
      ...
    },
    move (barrage, node) {
      ...
    },
    remove (barrage, node) {
      ...
    },
    destroy (barrage, node) {
      ...
    },
    show (barrage, node) {
      ...
    },
    hidden (barrage, node) {
      ...
    },
  })
```

特殊弹幕
```js
  const data = {}

  manager.sendSpecial({
    data, // 特殊弹幕与普通弹幕在 data 上的行为不一样，特殊弹幕的 data 需要手动传入
    duration: 5,
    direction: 'right',
    position: () => ({ x: 100, y: 100 }),
    hooks: {
      create (barrage, node) {
        node.style.background = 'red'
        console.log(barrage.data === data) // true
      },
      append (barrage, node) {
        ...
      },
      move (barrage, node) {
        ...
      },
      remove (barrage, node) {
        ...
      },
      destroy (barrage, node) {
        ...
      },
      show (barrage, node) {
        ...
      },
      hidden (barrage, node) {
        ...
      },
    }
  })
```

