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
    callHook(this.hooks, 'create', [this.node, this])
    callHook(this.manager.opts.hooks, 'barrageCreate', [this.node, this])
  }

  getMovePrecent () {
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo
    const currentTime = this.paused ? prevPauseTime : Date.now()

    return (currentTime - startTime - pauseTime) / 1000 / this.opts.duration
  }

  pause () {
    if (!this.moveing || this.paused) return
    
    const direction = this.opts.direction
    const totalDistance = direction === 'none'
      ? Number.MIN_VALUE
      : this.RuntimeManager.containerWidth + this.getWidth()
    const { x, y } = this.startPosition
    let moveDistance = this.getMovePrecent() * totalDistance

    if (direction === 'right') {
      // moveDistance *= -1
    }

    console.log(moveDistance);

    this.paused = true
    this.timeInfo.prevPauseTime = Date.now()

    this.node.style[transitionDuration] = '0s'
    // this.node.style.transform = `translateX(${moveDistance}px) ${translateY}`
  }

  resume () {
    if (!this.moveing || !this.paused) return

    this.paused = false
  }

  append () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.appendChild(this.node)

      callHook(this.hooks, 'append', [this.node, this])
      callHook(this.manager.opts.hooks, 'barrageAppend', [this.node, this])
    }
  }
  
  remove () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.removeChild(this.node)

      callHook(this.hooks, 'remove', [this.node, this])
      callHook(this.manager.opts.hooks, 'barrageRemove', [this.node, this])
    }
  }

  destroy () {
    this.remove()
    this.moveing = false

    const index = this.manager.specialBarrages.indexOf(this)
    if (~index) {
      this.manager.specialBarrages.splice(index, 1)
    }

    callHook(this.hooks, 'destroy', [this.node, this])
    callHook(this.manager.opts.hooks, 'barrageDestroy', [this.node, this])
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