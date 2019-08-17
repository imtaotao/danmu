import { warning, callHook, createKey } from './utils'

export class SpecialBarrage {
  constructor (opts) {
    this.opts = opts
    this.node = null
    this.isSpecial = true
    this.data = opts.data || null
    this.key = opts.id || createKey()
  }

  getHeight () {
    return (this.node && this.node.clientHeight) || 0
  }

  getWidth () {
    return (this.node && this.node.clientWidth) || 0
  }

  create (manager) {
    this.node = document.createElement('div')
    callHook(manager.opts.hooks, 'barrageCreate', [this.node, this])
  }

  append (manager) {
    warning(manager.container, 'Need container element.')
    if (this.node) {
      manager.container.appendChild(this.node)
      callHook(manager.opts.hooks, 'barrageAppend', [this.node, this])
    }
  }
  
  remove (manager) {
    warning(manager.container, 'Need container element.')
    if (this.node) {
      manager.container.removeChild(this.node)
      callHook(manager.opts.hooks, 'barrageRemove', [this.node, this])
    }
  }

  destroy (manager) {
    this.remove(manager)
    const index = manager.specialBarrages.indexOf(this)

    if (~index) {
      manager.specialBarrages.splice(index, 1)
    }

    callHook(manager.opts.hooks, 'barrageDestroy', [this.node, this])
    this.node = null
  }
}

export default function createSpecialBarrage (opts = {}) {
  opts = Object.assign({
    x: 0, // 默认起始位置
    y: 0,
    duration: 0, // 默认不显示
    move: 'none', // left or right or none
  }, opts)

  return new SpecialBarrage(opts)
}