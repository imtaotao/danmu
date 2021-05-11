import {
  warning,
  callHook,
  createKey,
  transitionDuration,
} from './utils'

export default class Barrage {
  constructor (itemData, hooks, time, manager, globalHooks) {
    const RuntimeManager = manager.RuntimeManager
    const { direction, container } = manager.opts
    
    this.node = null
    this.hooks = hooks
    this.paused = false
    this.moveing = false
    this.data = itemData
    this.duration = time
    this.isSpecial = false
    this.trajectory = null
    this.manager = manager
    this.direction = direction
    this.container = container
    this.isChangeDuration = false
    this.globalHooks = globalHooks
    this.RuntimeManager = RuntimeManager
    this.key = itemData.key || createKey()
    this.position = {
      y: null,
    }
    this.timeInfo = {
      pauseTime: 0, // 总共暂停了多少时间
      startTime: null, // 开始移动的时间
      prevPauseTime: null, // 上次暂停的时间
      currentDuration: time, // 当前实时运动时间，因为每次暂停会重置 transition duration
    }

    this.create()
  }

  // API
  getMovePercent () {
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo
    const currentTime = this.paused ? prevPauseTime : Date.now()

    return (currentTime - startTime - pauseTime) / 1000 / this.duration
  }

  // 得到当前移动了多少距离
  getMoveDistance () {
    if (!this.moveing) return 0
    const percent = this.getMovePercent()
    const containerWidth = this.RuntimeManager.containerWidth + this.getWidth()
    return percent * containerWidth
  }

  // API
  getHeight () {
    return (this.node && this.node.clientHeight) || 0
  }

  // API
  getWidth () {
    return (this.node && this.node.clientWidth) || 0
  }

  // 得到当前弹幕的运动速度
  getSpeed () {
    const duration = this.timeInfo.currentDuration
    const containerWidth = this.RuntimeManager.containerWidth + this.getWidth()
    
    return duration == null || containerWidth == null
      ? 0
      : containerWidth / duration
  }

  create () {
    this.node = document.createElement('div')
    callHook(this.hooks, 'create', [this, this.node])
    callHook(this.globalHooks, 'barrageCreate', [this, this.node])
  }

  append () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.appendChild(this.node)
      callHook(this.hooks, 'append', [this, this.node])
      callHook(this.globalHooks, 'barrageAppend', [this, this.node])
    }
  }
  
  remove (noCallHook) {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.removeChild(this.node)
      if (!noCallHook) {
        callHook(this.hooks, 'remove', [this, this.node])
        callHook(this.globalHooks, 'barrageRemove', [this, this.node])
      }
    }
  }

  // 从内从中清除当前的节点
  deletedInMemory () {
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
  }
  
  // API 销毁当前节点
  destroy () {
    this.remove()
    this.moveing = false
    this.deletedInMemory()

    callHook(this.hooks, 'destroy', [this, this.node])
    callHook(this.globalHooks, 'barrageDestroy', [this, this.node])
    this.node = null
  }

  // API 暂停当前动画
  pause () {
    if (!this.moveing || this.paused) return
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

  // API 恢复当前
  resume () {
    if (!this.moveing || !this.paused) return

    this.paused = false

    // 增加暂停时间段
    this.timeInfo.pauseTime += Date.now() - this.timeInfo.prevPauseTime
    this.timeInfo.prevPauseTime = null
    
    const isNegative = this.direction === 'left' ? 1 : -1
    const containerWidth = this.RuntimeManager.containerWidth + this.getWidth()
    const remainingTime = (1 - this.getMovePercent()) * this.duration

    this.timeInfo.currentDuration = remainingTime
    this.node.style[transitionDuration] = `${remainingTime}s`
    this.node.style.transform = `translateX(${containerWidth * isNegative}px)`
  }

  // 恢复初始状态，以便复用
  reset () {
    // 从视图中删除，在内存中删除
    this.remove(true)
    this.deletedInMemory()

    this.paused = false
    this.moveing = false
    this.trajectory = null
    this.position = {
      y: null,
    }
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
      currentDuration: this.duration,
    }
  }
}