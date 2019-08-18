import { warning, callHook, createKey } from './utils'

export class SpecialBarrage {
  constructor (opts) {
    this.opts = opts
    this.node = null
    this.moveing = false
    this.isSpecial = true
    this.hooks = opts.hooks
    this.data = opts.data || null
    this.key = opts.key || createKey()

    this.timeInfo = {
      pauseTime: 0, // 总共暂停了多少时间
      startTime: null, // 开始移动的时间
      prevPauseTime: null, // 上次暂停的时间
      currentDuration: opts.duration, // 当前实时运动时间，因为每次暂停会重置 transition duration
    }
  }

  getHeight () {
    return (this.node && this.node.clientHeight) || 0
  }

  getWidth () {
    return (this.node && this.node.clientWidth) || 0
  }

  create (manager) {
    this.node = document.createElement('div')
    callHook(this.hooks, 'create', [this.node, this])
    callHook(manager.opts.hooks, 'barrageCreate', [this.node, this])
  }

  getMovePrecent () {
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo
    const currentTime = this.paused ? prevPauseTime : Date.now()

    return (currentTime - startTime - pauseTime) / 1000 / this.duration
  }

  append (manager) {
    warning(manager.container, 'Need container element.')
    if (this.node) {
      manager.container.appendChild(this.node)
      callHook(this.hooks, 'append', [this.node, this])
      callHook(manager.opts.hooks, 'barrageAppend', [this.node, this])
    }
  }
  
  remove (manager) {
    warning(manager.container, 'Need container element.')
    if (this.node) {
      manager.container.removeChild(this.node)
      callHook(this.hooks, 'remove', [this.node, this])
      callHook(manager.opts.hooks, 'barrageRemove', [this.node, this])
    }
  }

  destroy (manager) {
    this.remove(manager)
    this.moveing = false

    const index = manager.specialBarrages.indexOf(this)
    if (~index) {
      manager.specialBarrages.splice(index, 1)
    }

    callHook(this.hooks, 'destroy', [this.node, this])
    callHook(manager.opts.hooks, 'barrageDestroy', [this.node, this])
    this.node = null
  }
}

export default function createSpecialBarrage (opts = {}) {
  opts = Object.assign({
    hooks: {},
    duration: 0, // 默认不显示
    direction: 'none', // left or right or none
    position: () => ({ x: 0, y: 0 }), // 默认起始位置,
  }, opts)

  return new SpecialBarrage(opts)
}