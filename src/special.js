import {
  warning,
  callHook,
  createKey,
  transitionDuration,
} from './utils'

export class SpecialBarrage {
  constructor (manager, opts) {
    this.opts = opts
    this.node = null
    this.paused = false
    this.moveing = false
    this.isSpecial = true
    this.manager = manager
    this.container = manager.opts.container
    this.RuntimeManager = manager.RuntimeManager

    this.hooks = opts.hooks
    this.data = opts.data || null
    this.key = opts.key || createKey()

    this.moveTimer = null // 当 direction 为 none, 用此变量保存定时器
    this.timeInfo = {
      pauseTime: 0, // 总共暂停了多少时间
      startTime: null, // 开始移动的时间
      prevPauseTime: null, // 上次暂停的时间
      currentDuration: opts.duration, // 当前实时运动时间，因为每次暂停会重置 transition duration
    }

    this.startPosition = {
      x: null,
      y: null,
    }
  }

  getHeight () {
    return (this.node && this.node.clientHeight) || 0
  }

  getWidth () {
    return (this.node && this.node.clientWidth) || 0
  }

  create () {
    this.node = document.createElement('div')
    callHook(this.hooks, 'create', [this, this.node])
    callHook(this.manager.opts.hooks, 'barrageCreate', [this, this.node])
  }

  getMovePercent () {
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo
    const currentTime = this.paused ? prevPauseTime : Date.now()

    return (currentTime - startTime - pauseTime) / 1000 / this.opts.duration
  }

  // (allDis - start) * percent
  getMoveDistance (direction, startPosition) {
    if (!this.moveing) return 0
    const percent = this.getMovePercent()
    
    if (direction === 'none') {
      return startPosition
    }

    if (direction === 'left') {
      const realMoveDistance = (this.RuntimeManager.containerWidth - startPosition) * percent
      return startPosition + realMoveDistance
    } else {
      const allMoveDistance = startPosition + this.getWidth()
      return startPosition - allMoveDistance * percent
    }
  }

  pause () {
    if (!this.moveing || this.paused) return
    this.paused = true
    this.timeInfo.prevPauseTime = Date.now()
    const direction = this.opts.direction

    if (direction === 'none') {
      // 删除定时器
      if (this.moveTimer) {
        this.moveTimer.clear()
      }
    } else {
      const { x, y } = this.startPosition
      const moveDistance = this.getMoveDistance(direction, x)
      
      this.node.style[transitionDuration] = '0s'
      this.node.style.transform = `translateX(${moveDistance}px) translateY(${y}px)`
    }
  }

  resume () {
    if (!this.moveing || !this.paused) return

    this.paused = false
    this.timeInfo.pauseTime += Date.now() - this.timeInfo.prevPauseTime
    this.timeInfo.prevPauseTime = null

    const direction = this.opts.direction
    const remainingTime = (1 - this.getMovePercent()) * this.opts.duration

    if (direction === 'none') {
      // 重新设置定时器
      const fn = this.moveTimer.callback || (() => {})
      let timer = setTimeout(fn, remainingTime * 1000)

      this.moveTimer.clear = () => {
        clearTimeout(timer)
        timer = null
      }
    } else {
      // 重新设置 style
      const { x, y } = this.startPosition
      const endPosition = this.opts.direction === 'left'
            ? this.RuntimeManager.containerWidth
            : -this.getWidth()

      this.node.style[transitionDuration] = `${remainingTime}s`
      this.node.style.transform = `translateX(${endPosition}px) translateY(${y}px)`
    }
  }

  append () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.appendChild(this.node)

      callHook(this.hooks, 'append', [this, this.node])
      callHook(this.manager.opts.hooks, 'barrageAppend', [this, this.node])
    }
  }
  
  remove () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.removeChild(this.node)

      callHook(this.hooks, 'remove', [this, this.node])
      callHook(this.manager.opts.hooks, 'barrageRemove', [this, this.node])
    }
  }

  destroy () {
    this.remove()
    this.moveing = false

    // 清除保存起来的，防止内存泄漏
    const index = this.manager.specialBarrages.indexOf(this)
    if (~index) {
      this.manager.specialBarrages.splice(index, 1)
    }

    // 如果存在定时器，清除
    if (this.moveTimer) {
      this.moveTimer.clear()
      this.moveTimer = null
    }

    callHook(this.hooks, 'destroy', [this, this.node])
    callHook(this.manager.opts.hooks, 'barrageDestroy', [this, this.node])
    this.node = null
  }
}

export default function createSpecialBarrage (manager, opts = {}) {
  opts = Object.assign({
    hooks: {},
    duration: 0, // 默认不显示
    direction: 'none', // left or right or none
    position: () => ({ x: 0, y: 0 }), // 默认起始位置,
  }, opts)

  return new SpecialBarrage(manager, opts)
}