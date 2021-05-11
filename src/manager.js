import Barrage from './barrage'
import RuntimeManager from './runtime'
import createSpecialBarrage from './special'
import { warning, callHook, timeSlice } from './utils'

export default class BarrageManager {
  constructor (opts) {
    this.opts = opts
    this.loopTimer = null
    this.plugins = new Map() // 存储所有的插件
    this.showBarrages = [] // 渲染在页面上的弹幕数量
    this.stashBarrages = []// 暂存的弹幕数量
    this.specialBarrages = [] // 特殊弹幕，特殊弹幕立即发立即渲染，移动完毕结束
    this.isShow = opts.isShow
    this.container = opts.container
    this.RuntimeManager = new RuntimeManager(opts)
  }

  get stashLength () {
    return this.stashBarrages.length
  }

  get specialLength () {
    return this.specialBarrages.length
  }

  get showLength () {
    return this.showBarrages.length + this.specialBarrages.length
  }

  get length () {
    return this.showBarrages.length + this.specialBarrages.length + this.stashBarrages.length
  }

  get containerWidth () {
    return this.RuntimeManager.containerWidth
  }

  get containerHeight () {
    return this.RuntimeManager.containerHeight
  }

  get runing () {
    return this.loopTimer !== null
  }

  // API 发送普通弹幕
  send (data, hooks, isForward) {
    if (Array.isArray(data)) {
      // 如果是一个数组，共用一组 hooks
      data = data.map(item => ({ data: item, hooks }))
    } else {
      data = [{ data, hooks }]
    }
    if (this.assertCapacity(data.length)) return false

    // 是否插入到最前面，这样可以最先出来
    isForward
      ? this.stashBarrages.unshift.apply(this.stashBarrages, data)
      : this.stashBarrages.push.apply(this.stashBarrages, data)
   
    callHook(this.opts.hooks, 'send', [this, data])
    return true
  }

  // API 发送特殊弹幕
  sendSpecial (data) {
    if (!this.runing) return false
    if (!Array.isArray(data)) data = [data]
    if (this.assertCapacity(data.length)) return false

    for (let i = 0; i < data.length; i++) {
      if (callHook(this.opts.hooks, 'willRender', [this, data[i], true]) !== false) {
        const barrage =  createSpecialBarrage(this, data[i])

        // 如果当前这个特殊弹幕时间小于等于 0，就不需要渲染
        // 如果渲染此视图会大于限制的数，也不应该渲染
        if (barrage.opts.duration <= 0 || this.showLength + 1 > this.opts.limit) {
          continue
        }

        barrage.create()
        barrage.append()
        this.specialBarrages.push(barrage)

        // 结束后销毁
        this.RuntimeManager.moveSpecialBarrage(barrage, this).then(() => {
          barrage.destroy()
          if (this.length === 0) {
            callHook(this.opts.hooks, 'ended', [this])
          }
        })
      }
    }

    callHook(this.opts.hooks, 'sendSpecial', [this, data])
    return true
  }

  // API 显示所有弹幕
  show () {
    if (!this.isShow) {
      this.isShow = true
      this.each(barrage => {
        if (barrage.node) {
          barrage.node.style.visibility = 'visible'
          barrage.node.style.pointerEvents = 'auto'
        }
        callHook(barrage.hooks, 'show', [barrage, barrage.node])
      })
      callHook(this.opts.hooks, 'show', [this])
    }
  }

  // API 隐藏所有弹幕
  hidden () {
    if (this.isShow) {
      this.isShow = false
      this.each(barrage => {
        if (barrage.node) {
          barrage.node.style.visibility = 'hidden'
          barrage.node.style.pointerEvents = 'none'
        }
        callHook(barrage.hooks, 'hidden', [barrage, barrage.node])
      })
      callHook(this.opts.hooks, 'hidden', [this])
    }
  }

  // API 遍历在渲染中的节点
  each (callback) {
    if (typeof callback === 'function') {
      let i = 0
      for (; i < this.specialBarrages.length; i++) {
        callback(this.specialBarrages[i], i)
      }

      for (i = 0; i < this.showBarrages.length; i++) {
        const barrage = this.showBarrages[i]
        if (barrage.moveing) {
          callback(barrage, i)
        }
      }
    }
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
  }

  // API 循环检测添加弹幕
  start (noCallHook) {
    const core = () => {
      this.loopTimer = setTimeout(() => {
        this.renderBarrage()
        core()
      }, this.opts.interval * 1000)
    }

    this.stop(true)
    core()

    if (!noCallHook) {
      callHook(this.opts.hooks, 'start', [this])
    }
  }

  // API 重新设置参数
  setOptions (opts) {
    if (opts) {
      // 清除定时器，重新根据新的时间开始
      this.opts = Object.assign(this.opts, opts)

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
  }

  // API 重新计算轨道
  resize () {
    this.RuntimeManager.resize()
    callHook(this.opts.hooks, 'resize', [this])
  }

  // API 清空缓存，立即终止
  clear () {
    this.stop()
    this.each(barrage => barrage.remove())
    this.showBarrages = []
    this.stashBarrages = []
    this.specialBarrages = []
    this.RuntimeManager.container = []
    this.RuntimeManager.resize()

    callHook(this.opts.hooks, 'clear', [this])
  }

  // API clone 当前示例
  clone (opts) {
    opts = opts
      ? Object.assign(this.opts, opts)
      : this.opts
    // 至于插件，得让外部使用者自己重新安装
    return new this.constructor(opts)
  }

  // API 添加插件
  use (fn, ...args) {
    warning(
      typeof fn === 'function',
      'Plugin must be a function.'
    )
    if (this.plugins.has(fn)) {
      return this.plugins.get(fn)
    }
    const result = fn(this, ...args)
    this.plugins.set(fn, result)
    return result
  }

  // 判断是否超过容量
  assertCapacity (n) {
    const res = n + this.length > this.opts.capacity
    if (res) {
      callHook(this.opts.hooks, 'capacityWarning', [this])
      console.warn(`The number of barrage is greater than "${this.opts.capacity}".`)
    }
    return res
  }

  // 初始化弹幕
  renderBarrage () {
    if (this.stashBarrages.length > 0) {
      const { rows, rowGap } = this.RuntimeManager
      let length = this.opts.limit - this.showLength

      // 一次弹出的弹幕最多只能把所有的轨道塞满
      // 如果大于轨道树就需要优化，避免不必要的计（实测，内存占用好像区别不大...）
      // 但是如果我们发现 rowGap <= 0，就是没有限制，那么弹幕会实时出现
      // 所有的轨道都会不停出现弹幕，就要去掉这个优化
      // 但此时如果不小心就会导致内存飙升，这个种场景适合弹幕立即发送，立即出现的场景
      if (rowGap > 0 && length > rows) {
        length = this.RuntimeManager.rows
      }

      // 如果需要强行渲染的话
      if (this.opts.forceRender || length > this.stashBarrages.length) {
        length = this.stashBarrages.length
      }

      if (length > 0 && this.runing) {
        timeSlice(length, () => {
          const currentBarrage = this.stashBarrages.shift()
          // 如果 willRender 钩子返回 false 就不需要渲染当前钩子，也可以对数据进行更改
          if (callHook(this.opts.hooks, 'willRender', [this, currentBarrage, false]) !== false) {
            const needStop = this.initSingleBarrage(currentBarrage.data, currentBarrage.hooks)
            if (needStop) {
              return false
            }
          }
        })
        callHook(this.opts.hooks, 'render', [this])
      }
    }
  }

  // 初始化一个弹幕
  initSingleBarrage (data, hooks) {
    const barrage = data instanceof Barrage
      ? data
      : this.createSingleBarrage(data, hooks)
    const newBarrage = barrage && this.sureBarrageInfo(barrage)

    if (newBarrage) {
      // 当前这个弹幕需要渲染到屏幕上
      newBarrage.append()
      this.showBarrages.push(newBarrage)
      newBarrage.trajectory.values.push(newBarrage)

      // 弹幕运动结束后删掉
      this.RuntimeManager.move(newBarrage, this).then(() => {
        newBarrage.destroy()
        if (this.length === 0) {
          callHook(this.opts.hooks, 'ended', [this])
        }
      })
    } else {
      // 否则就先存起来，按道理说只会存一个
      // 按照现有的逻辑，最后一个会不停的取出来，然后存起来
      this.stashBarrages.unshift(barrage)
      return true
    }
  }

  createSingleBarrage (data, hooks) {
    const [max, min] = this.opts.times
    const time = Number(
      max === min
        ? max
        : (Math.random() * (max - min) + min).toFixed(0)
    )

    // 时间小于等于 0，将不会渲染
    if (time <= 0) return null
    
    return new Barrage(
      data,
      hooks,
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
  setBarrageStyle (barrage, node) {
    const { hooks = {}, direction } = this.opts

    node.style.opacity = 0
    node.style[direction] = 0
    node.style.position = 'absolute'
    node.style.display = 'inline-block'
    node.style.pointerEvents = this.isShow ? 'auto' : 'none'
    node.style.visibility = this.isShow ? 'visible' : 'hidden'

    callHook(hooks, 'barrageCreate', [barrage, node])
  }
}