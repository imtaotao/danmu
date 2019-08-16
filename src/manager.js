import Barrage from './barrage'
import { callHook } from './utils'
import RuntimeManager from './runtime'

export default class BarrageManager {
  constructor (opts) {
    this.opts = opts
    this.loopTimer = null
    this.showBarrages = [] // 渲染在页面上的弹幕数量
    this.stashBarrages = []// 暂存的弹幕数量
    this.isShow = opts.isShow
    this.container = opts.container
    this.RuntimeManager = new RuntimeManager(opts)
  }

  get length () {
    return this.showBarrages.length + this.stashBarrages.length
  }

  get showLength () {
    return this.showBarrages.length
  }

  get stashLength () {
    return this.stashBarrages.length
  }

  get runing () {
    return this.loopTimer !== null
  }

  // API 发送弹幕
  send (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }

    if (data.length + this.length > this.opts.capcity) {
      console.warn(`The number of barrage is greater than "${this.opts.capcity}".`)
      return false
    }

    this.stashBarrages.push.apply(this.stashBarrages, data)
    callHook(this.opts.hooks, 'send', [this, data])
    return true
  }

  // API 显示所有弹幕
  show () {
    if (!this.isShow) {
      this.isShow = true
      this.each(barrage => {
        barrage.node.style.visibility = 'visible'
        barrage.node.style.pointerEvents = 'auto'
      })
      callHook(this.opts.hooks, 'show', [this])
    }
    return this
  }

  // API 隐藏所有弹幕
  hidden () {
    if (this.isShow) {
      this.isShow = false
      this.each(barrage => {
        barrage.node.style.visibility = 'hidden'
        barrage.node.style.pointerEvents = 'none'
      })
      callHook(this.opts.hooks, 'hidden', [this])
    }
    return this    
  }

  // API 遍历在渲染中的节点
  each (cb) {
    if (typeof cb === 'function') {
      this.showBarrages.forEach(cb)
    }
    return this
  }

  // API 停止轮询添加弹幕
  stop (noCallHook) {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
      this.loopTimer = null

      if (!noCallHook) {
        callHook(this.opts.hooks, 'stop', [this])
      }
    }
    return this
  }

  // API 循环检测添加弹幕
  start (noCallHook) {
    const core = () => {
      this.loopTimer = setTimeout(() => {
        this.renderBarrage()
        core()
      }, this.opts.interval)
    }

    this.stop(true)
    core()

    if (!noCallHook) {
      callHook(this.opts.hooks, 'start', [this])
    }
  
    return this
  }

  // API 重新设置参数
  setOptions (opts) {
    if (opts) {
      this.opts = Object.assign(this.opts, opts)
      // 清除定时器，重新根据新的时间开始
      if ('interval' in opts) {
        this.stop(true)
        this.start(true)
      }
      // 如果有高度，要重新计算轨道
      if ('height' in opts) {
        this.RuntimeManager.singleHeight = opts.height
        this.RuntimeManager.resize()
      }
      // 设置 rowGap
      if ('rowGap' in opts) {
        this.RuntimeManager.rowGap = opts.rowGap
      }

      callHook(this.opts.hooks, 'setOptions', [this, opts])
    }
    return this
  }

  // API 重新计算轨道
  resize () {
    this.RuntimeManager.resize()
    callHook(this.opts.hooks, 'resize', [this])
    return this
  }

  // API 清空缓存，立即终止
  clear () {
    this.stop()
    this.each(barrage => barrage.remove())

    this.showBarrages = []
    this.stashBarrages = []
    this.RuntimeManager.container = []
    this.RuntimeManager.resize()

    callHook(this.opts.hooks, 'clear', [this])
  }

  // 初始化弹幕
  renderBarrage () {
    if (this.stashBarrages.length > 0) {
      let length = this.opts.limit - this.showBarrages.length

      // 一次弹出的弹幕最多只能把所有的轨道塞满
      // 如果大于轨道树就需要优化，避免不必要的计（实测，内存占用好像区别不大...）
      // 但是如果我们发现 rowGap <= 0，就是没有限制，那么弹幕会实时出现
      // 所有的轨道都会不停出现弹幕，就要去掉这个优化
      // 但此时如果不小心就会导致内存飙升，这个种场景适合弹幕立即发送，立即出现的场景
      if (length > this.RuntimeManager.rows && this.RuntimeManager.rowGap > 0) {
        length = this.RuntimeManager.rows
      }

      if (length > this.stashBarrages.length) {
        length = this.stashBarrages.length
      }

      if (length > 0 && this.runing) {
        for (let i = 0; i < length; i++) {
          const data = this.stashBarrages.shift()
          if (data) {
            this.initSingleBarrage(data)
          }
        }

        callHook(this.opts.hooks, 'render', [this])
      }
    }
  }

  // 初始化一个弹幕
  initSingleBarrage (data) {
    const barrage = data instanceof Barrage ? data : this.createSingleBarrage(data)
    const newBarrage = this.sureBarrageInfo(barrage)

    if (newBarrage) {
      // 当前这个弹幕需要渲染到屏幕上
      newBarrage.append()
      this.showBarrages.push(newBarrage)
      newBarrage.trajectory.values.push(newBarrage)

      // 如果发现没有合适的位置可以移动，就等待下一次 render
      const failed = () => {
        newBarrage.remove(true)
        newBarrage.deletedInMemory()
        newBarrage.node.style.top = null
        this.stashBarrages.unshift(newBarrage)
      }

      this.RuntimeManager.move(newBarrage, this.isShow, failed).then(() => {
        // 弹幕运动结束后删掉
        newBarrage.destroy()

        if (this.length === 0) {
          callHook(this.opts.hooks, 'ended', [this])
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
    const time = Number(
      max === min
        ? max
        : (Math.random() * (max - min) + min).toFixed(0)
    )
    
    return new Barrage(
      data,
      time,
      this,
      Object.assign({}, this.opts.hooks, {
        barrageCreate: this.setBarrageStyle.bind(this),
      })
    )
  }

  // 初始化弹幕的位置信息
  sureBarrageInfo (barrage) {
    const trajectory = this.RuntimeManager.getTrajectory()

    // 没有弹道信息代表现在页面上不能出现
    if (!trajectory) return null

    barrage.trajectory = trajectory
    barrage.position.y = trajectory.gaps[0]

    return barrage
  }

  // 设置弹幕的样式
  setBarrageStyle (node, barrage) {
    const { hooks = {}, direction } = this.opts

    callHook(hooks, 'barrageCreate', [node, barrage])

    node.style.opacity = 0
    node.style[direction] = 0
    node.style.position = 'absolute'
    node.style.display = 'inline-block'
    node.style.pointerEvents = this.isShow ? 'auto' : 'none'
    node.style.visibility = this.isShow ? 'visible' : 'hidden'
  }
}