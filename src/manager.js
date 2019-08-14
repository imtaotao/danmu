import Barrage from './barrage'
import { callHook } from './utils'
import RuntimeManager from './runtime'

export default class BarrageManager {
  constructor (opts) {
    this.opts = opts
    this.isShow = true
    this.loopTimer = null
    this.showBarrages = [] // 渲染在页面上的弹幕数量
    this.stashBarrages = []// 暂存的弹幕数量
    this.RuntimeManager = new RuntimeManager(opts)
  }

  get length () {
    return this.showBarrages.length + this.stashBarrages.length
  }

  // 发送弹幕
  send (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }

    if (data.length + this.length > this.opts.capcity) {
      console.warn(`The number of barrage is greater than "${this.opts.capcity}".`)
      return false
    }
    this.stashBarrages.push.apply(this.stashBarrages, data)
    return true
  }

  // 显示所有弹幕
  show () {
    if (!this.isShow) {
      this.isShow = true
      this.each(barrage => {
        barrage.node.style.visibility = 'visible'
        barrage.node.style.pointerEvents = 'auto'
      })
    }
    return this
  }

  // 隐藏所有弹幕
  hiden () {
    if (this.isShow) {
      this.isShow = false
      this.each(barrage => {
        barrage.node.style.visibility = 'hidden'
        barrage.node.style.pointerEvents = 'none'
      })
    }
    return this    
  }

  // 遍历在渲染中的节点
  each (cb) {
    if (typeof cb === 'function') {
      this.showBarrages.forEach(cb)
    }
    return this
  }

  stop () {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
      this.loopTimer = null
    }
    return this
  }

  // 循环检测添加弹幕
  start () {
    const core = () => {
      this.loopTimer = setTimeout(() => {
        this.renderBarrage()
        core()
      }, this.opts.interval)
    }
    this.stop()
    core()
    return this
  }

  // 重新设置参数
  setOptions (opts) {
    if (opts) {
      this.opts = Object.assign(this.opts, opts)
      if ('interval' in opts) {
        this.stop()
        this.start()
      }
    }
    return this
  }

  // 立即销毁当前实例
  clear () {
    this.stop()
    this.each(barrage => barrage.remove())
    this.showBarrages = []
    this.stashBarrages = []
  }

  // 初始化弹幕
  renderBarrage () {
    if (this.stashBarrages.length > 0) {
      let length = this.opts.limit - this.showBarrages.length

      if (length > this.stashBarrages.length) {
        length = this.stashBarrages.length
      }

      if (length > 0) {
        for (let i = 0; i < length; i++) {
          const data = this.stashBarrages.shift()
          if (data) {
            this.initSingleBarrage(data)
          }
        }
      }
    }
  }

  // 初始化一个弹幕
  initSingleBarrage (data) {
    const barrage = data instanceof Barrage ? data : this.createSingleBarrage(data)
    const newBarrage = this.sureBarrageInfo(barrage)

    if (newBarrage) {
      // 当前这个弹幕需要渲染到屏幕上
      const trajectory = newBarrage.position.trajectory

      newBarrage.append()
      this.showBarrages.push(newBarrage)
      trajectory.values.push(newBarrage)

      this.RuntimeManager.move(newBarrage, this.isShow)
        .then(() => {
          // 弹幕运动结束后删掉
          newBarrage.remove()
          newBarrage.moveing = false

          // 删除存起来的
          let index = -1
          if (trajectory.values.length > 0) {
            index = trajectory.values.indexOf(newBarrage)
            if (~index) trajectory.values.splice(index, 1)
          }

          if (this.showBarrages.length > 0) {
            index = this.showBarrages.indexOf(newBarrage)
            if (~index) this.showBarrages.splice(index, 1)
          }
        })
    } else {
      // 否则就先存起来，按道理说只会存一个
      // 按照现有的逻辑，最后一个会不停的取出来，然后存起来
      this.stashBarrages.unshift(barrage)
    }
  }

  createSingleBarrage (data) {
    const [max, min] = this.opts.times
    const container = this.opts.container
    const time = (Math.random() * (max - min) + min).toFixed(0)

    return new Barrage(
      data,
      time,
      container,
      this.RuntimeManager,
      this.opts.direction,
      Object.assign({}, this.opts.hooks, {
        create: this.setBarrageStyle.bind(this),
      })
    )
  }

  // 初始化弹幕的位置信息
  sureBarrageInfo (barrage) {
    const position = barrage.position
    const runtime = this.RuntimeManager
    const trajectory = runtime.getTrajectory()

    // 没有弹道信息代表现在页面上不能出现
    if (!trajectory) return null

    position.y = trajectory.gaps[0]
    position.trajectory = trajectory

    return barrage
  }

  // 设置弹幕的样式
  setBarrageStyle (node, barrage) {
    const { hooks = {}, direction } = this.opts

    callHook(hooks, 'create', [node, barrage])

    node.style.opacity = 0
    node.style[direction] = 0
    node.style.position = 'absolute'
    node.style.display = 'inline-block'
    node.style.pointerEvents = this.isShow ? 'auto' : 'none'
    node.style.visibility = this.isShow ? 'visible' : 'hidden'
  }
}