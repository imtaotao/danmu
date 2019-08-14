import { warning, callHook, createKey  } from './utils'

export default class Barrage {
  constructor (itemData, time, container, hooks) {
    this._width = null
    this.hooks = hooks
    this.paused = false
    this.moveing = false
    this.data = itemData
    this.container = container
    this.duration = Number(time)
    this.key = itemData.id || createKey()
    this.position = {
      y: null,
      startTime: null,
      trajectory: null,
    }

    this.create()
  }

  width () {
    return new Promise(resolve => {
      let i = 0
      if (this._width) {
        return resolve(this._width)
      }

      const fn = () => {
        warning(++i < 99, 'Unable to get the barr width.')
        setTimeout(() => {
          let width = getComputedStyle(this.node).width
          if (width == null || width === '') {
            fn()
          } else {
            width = parseInt(width)
            this._width = width
            resolve(width)
          }
        })
      }
      fn()
    })
  }

  create () {
    const node = document.createElement('div')
    node.id = 'barrage_' + this.key
    this.node = node
    callHook(this.hooks, 'create', [node, this])
  }

  append () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.appendChild(this.node)
      callHook(this.hooks, 'append', [this.node, this])
    }
  }

  remove () {
    warning(this.container, 'Need container element.')
    if (this.node) {
      this.container.removeChild(this.node)
      callHook(this.hooks, 'remove', [this.node, this])
    }
  }

  // 暂停当前动画
  pause () {
    if (this.moveing && !this.paused) {
      this.paused = true
      this.width().then(w => {
        const percent = (Date.now() - this.position.startTime) / this.duration
        console.log(percent);
      })
    }
  }

  // 暂定当前
  resume () {
    if (this.moveing && this.paused) {
      this.paused = false
    }
  }

  // 恢复初始状态，以便复用
  reset () {
    this.position = {
      y: null,
      startTime: null,
      trajectory: null,
    }
  }
}