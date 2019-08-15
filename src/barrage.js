import {
  warning,
  toNumber,
  callHook,
  createKey,
  transitionDuration,
} from './utils'

export default class Barrage {
  constructor (itemData, time, manager, hooks) {
    const RuntimeManager = manager.RuntimeManager
    const { direction, container } = manager.opts

    this._width = null
    this.hooks = hooks
    this.paused = false
    this.moveing = false
    this.data = itemData
    this.trajectory = null
    this.manager = manager
    this.direction = direction
    this.container = container
    this.duration = Number(time)
    this.RuntimeManager = RuntimeManager
    this.key = itemData.id || createKey()
    this.position = {
      y: null,
      trajectory: null,
    }
    this.timeInfo = {
      pauseTime: 0, // 总共暂停了多少时间
      startTime: null, // 开始移动时间
      prevPauseTime: null, // 上次暂停的时间
    }

    this.create()
  }

  // 得到当前移动了多少距离
  getMoveDistance () {
    if (!this.moveing) return 0
    const extendDis = this.width || 0
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo

    const currentTime = this.paused ? prevPauseTime : Date.now()
    const containerWidth = this.RuntimeManager.containerWidth + extendDis
    const percent = (currentTime - startTime - pauseTime) / 1000 / this.duration

    return percent * containerWidth
  }

  getWidth () {
    return new Promise(resolve => {
      let i = 0
      const fn = () => {
        warning(++i < 999, 'Unable to get the barr width.')
        setTimeout(() => {
          let width = getComputedStyle(this.node).width
          if (width == null || width === '') {
            fn()
          } else {
            width = toNumber(width)
            resolve(width)
          }
        })
      }
      fn()
    })
  }

  create () {
    const node = document.createElement('div')
    node.id = this.key
    this.node = node
    callHook(this.hooks, 'barrageCreate', [node, this])
  }

  append () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.appendChild(this.node)
      // 添加宽度
      this.getWidth().then(width => {
        this.width = width
        callHook(this.hooks, 'barrageAppend', [this.node, this])
      })
    }
  }
  
  remove () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.removeChild(this.node)
      callHook(this.hooks, 'barrageRemove', [this.node, this])
    }
  }

  // API 销毁当前节点
  destroy (noCallHook) {
    this.remove()
    this.moveing = false

    
    let index = -1
    const trajectory = this.trajectory
    const showBarrages = this.manager.showBarrages

    // 删除内存中存起来的弹幕类
    if (trajectory && trajectory.values.length > 0) {
      index = trajectory.values.indexOf(this)
      if (~index) trajectory.values.splice(index, 1)
    }

    if (showBarrages && showBarrages.length > 0) {
      index = showBarrages.indexOf(this)
      if (~index) showBarrages.splice(index, 1)
    }

    if (!noCallHook) {
      callHook(this.hooks, 'barrageDestroy', [this.node, this])
    }
  }

  // API 暂停当前动画
  pause () {
    if (this.moveing && !this.paused) {
      let moveDistance = this.getMoveDistance()
  
      if (!Number.isNaN(moveDistance)) {
        this.paused = true
        this.timeInfo.prevPauseTime = Date.now()

        if (this.direction === 'right') {
          moveDistance *= -1
        }

        this.node.style[transitionDuration] = '0s'
        this.node.style.transform = `translateX(${moveDistance}px)`
      }
    }
  }

  // API 恢复当前
  resume () {
    if (this.moveing && this.paused) {
      this.paused = false

      // 增加暂停时间段
      this.timeInfo.pauseTime += Date.now() - this.timeInfo.prevPauseTime
      this.timeInfo.prevPauseTime = null
      
      const des = this.direction === 'left' ? 1 : -1
      const containerWidth = this.RuntimeManager.containerWidth + this.width
      const remainingTime = (1 - this.getMoveDistance() / containerWidth) * this.duration

      this.node.style[transitionDuration] = `${remainingTime}s`
      this.node.style.transform = `translateX(${containerWidth * des}px)`
    }
  }

  // 恢复初始状态，以便复用
  reset () {
    this.position = {
      y: null,
      trajectory: null,
    }
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
    }
    this.trajectory = null
  }
}