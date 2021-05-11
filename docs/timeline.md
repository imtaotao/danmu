## 时间轴
当需要弹幕与视频结合起来使用时，就需要时间轴这个插件了

API
  + `add(timestamp: number, barrageData: any | Array<any>, hooks?: Object, isForward?: boolean) : void`
  + `addSpecial(timestamp: number, specialBarrageData: any | Array<any>) : void`
  + `emit(timestamp: number, clearOld?: boolean) : void`
  + `emitInterval(timestamp: number, clearOld?: boolean): void`
  + `destroy(): void`

## demo
```js
  const manager = Danmuku.create({})
  // forceRender 的作用是开启碰撞检测，当弹幕数量超过视图容器的阈值时，将取消碰撞检测，因为要保证弹幕的实时性
  // 当弹幕数量低于视图容器的阈值时，又会重新开启碰撞检测，如果不开启将会导致弹幕不是实时性的
  const timeline = manager.use(Danmuku.Timeline, { forceRender: true })

  // 添加一个 10s 的弹幕
  timeline.add(10, 'barrageText', {
    // 弹幕渲染到页面上时
    append (barrage, node) {
      node.onmouseenter = e => {
        barrage.pause()
      }
      node.onmouseleave = e => {
        barrage.resume()
      }
      node.onclick = e => {
        barrage.destroy()
      }
    },
  })

  // 触发 10s 这个时间点的弹幕
  timeline.emit(10)
  // 如果 emit 时， clearOld 为 ture，将会在触发后清空当前时间点的弹幕数据
  timeline.emit(10, true)
```

## Tips
+ `emitInterval` 方法与 `emit` 方法的区别是，你触发时，不允许连续触发相同的时间，也就是说你要触发同一个时间点的弹幕，得间隔的去触发
+ `timeline.add` 与 `manager.send` 方法参数一样，唯一的区别是多一个 `timestamp` 参数。同理，`timeline.addSpecial` 和 `manager.sendSpecial` 也是一样的
+ 可以看到时间轴这个插件就是一个简易的 eventbus 系统