import { warning, callHook, createKey  } from './utils'

export default class Barrage {
  constructor (itemData, time, container, RuntimeManager, direction, hooks) {
    this._width = null
    this.hooks = hooks
    this.paused = false
    this.moveing = false
    this.data = itemData
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
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo

    const containerWidth = this.RuntimeManager.containerWidth
    const currentTime = this.paused ? prevPauseTime : Date.now()
    const percent = (currentTime - startTime - pauseTime) / 1000 / this.duration

    return percent * containerWidth
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
    node.id = this.key
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
      this.timeInfo.prevPauseTime = Date.now()

      this.width().then(w => {
        const moveDistance = this.getMoveDistance()
        if (!Number.isNaN(moveDistance)) {
          // this.node.style.tranf
        }
      })
    }
  }

  // 暂定当前
  resume () {
    if (this.moveing && this.paused) {
      this.paused = false
      this.timeInfo.prevPauseTime = null
      // 增加暂停时间段
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
  }
}