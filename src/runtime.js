import {
  isRange,
  callHook,
  toNumber,
  upperCase,
  nextFrame,
  transitionProp,
  whenTransitionEnds,
} from './utils'

export default class RuntimeManager {
  constructor (opts) {
    const { container, rowGap, height } = opts
    const styles = getComputedStyle(container)

    if (
        !styles.position ||
        styles.position === 'none' ||
        styles.position === 'static'
    ) {
      container.style.position = 'relative'
    }

    this.opts = opts
    this.rowGap = rowGap
    this.singleHeight = height
    this.containerElement = container
    this.containerWidth = toNumber(styles.width)
    this.containerHeight = toNumber(styles.height)
    this.init()
  }

  // 初始化
  init () {
    this.container = []
    this.rows = parseInt(this.containerHeight / this.singleHeight)

    // 初始化弹道
    for (let i = 0; i < this.rows; i++) {
      const start = this.singleHeight * i
      const end = this.singleHeight * (i + 1) - 1

      this.container.push({
        values: [],
        gaps: [start, end],
      })
    }
  }

  resize () {
    const styles = getComputedStyle(this.containerElement)

    this.containerWidth = toNumber(styles.width)
    this.containerHeight = toNumber(styles.height)
    this.rows = parseInt(this.containerHeight / this.singleHeight)

    const container = []

    for (let i = 0; i < this.rows; i++) {
      const start = this.singleHeight * i
      const end = this.singleHeight * (i + 1) - 1
      const gaps = [start, end]

      // 把原先的移进来
      if (this.container[i]) {
        this.container[i].gaps = gaps
        container.push(this.container[i])
      } else {
        // 新的轨道
        container.push({ gaps, values: [] })
      }
    }

    this.container = container
  }

  // 获取最后一个移动的弹幕，但是如果前一个弹幕处于暂停中，就要往前找
  getLastBarrage (barrages, lastIndex) {
    for (let i = barrages.length - 1; i >= 0; i--) {
      const barrage = barrages[i - lastIndex]
      if (barrage && !barrage.paused) {
        return barrage
      }
    }
    return null
  }

  // 随机取一个轨道
  getRandomIndex (exclude) {
    const randomIndex = Math.floor(Math.random() * this.rows)
    return exclude.includes(randomIndex)
      ? this.getRandomIndex(exclude)
      : randomIndex
  }

  getTrajectory (alreadyFound = []) {
    // 如果发现全部都找过了，则代表没有合适的弹道可以选择
    if (alreadyFound.length === this.container.length) {
      // 如果需要强行渲染的话（在时间轴上为了实时出现）
      if (this.opts.forceRender) {
        const index = Math.floor(Math.random() * this.rows)
        return this.container[index]
      } else {
        return null
      }
    }
    
    const index = this.getRandomIndex(alreadyFound)
    const currentTrajectory = this.container[index]
    const lastBarrage = this.getLastBarrage(currentTrajectory.values, 0)

    if (this.rowGap <= 0 || !lastBarrage) {
      return currentTrajectory
    }

    alreadyFound.push(index)

    // 最后一个弹幕移动超过了我们限制的距离，就允许加入新的弹幕
    if (lastBarrage.moveing) {
      const distance = lastBarrage.getMoveDistance()
      const spacing = this.rowGap > 0
        ? this.rowGap + lastBarrage.getWidth()
        : this.rowGap

      return distance > spacing
        ? currentTrajectory
        : this.getTrajectory(alreadyFound)
    }

    return this.getTrajectory(alreadyFound)
  }

  // 计算追尾的时间，由于 css 动画的误差导致追尾的时间计算会有一点点的误差
  computingDuration (prevBarrage, currentBarrage) {
    const prevWidth = prevBarrage.getWidth()
    const currentWidth = currentBarrage.getWidth()
    const prevSpeed = prevBarrage.getSpeed()
    const currentSpeed = currentBarrage.getSpeed()
    const acceleration = currentSpeed - prevSpeed
    
    // 如果加速度小于等于 0，永远不可能追上
    if (acceleration <= 0) {
      return null
    }

    const distance = prevBarrage.getMoveDistance() - currentWidth - prevWidth
    const meetTime = distance / acceleration
  
    // 如果相遇时间大于于当前弹幕的运动时间，则肯会在容器视图外面追尾，不用管
    if (meetTime >= currentBarrage.duration) {
      return null
    }
  
    // 把此次弹幕运动时间修改为上一个弹幕移除屏幕的时间，这样追尾的情况在刚刚移除视图的时候进行
    const remainingTime = (1 - prevBarrage.getMovePercent()) * prevBarrage.duration
    const currentFixTime = currentWidth * remainingTime / this.containerWidth

    return remainingTime + currentFixTime
  }

  // 移动弹幕，move 方法不应该暴露给外部，所有放在 runtime 里面
  move (barrage, manager) {
    // 设置当前弹幕在哪一个弹道
    const node = barrage.node
    const prevBarrage = this.getLastBarrage(barrage.trajectory.values, 1)

    node.style.top = `${barrage.position.y}px`

    return new Promise(resolve => {
      nextFrame(() => {
        const width = barrage.getWidth()
        const isNegative = barrage.direction === 'left' ? 1 : -1
        const containerWidth = this.containerWidth + width

        // 计算追尾的情况
        // 如果 rowGap <= 0，那么就是没有做限制，不需要计算追尾的情况
        // 如果上一个弹幕没有移动，那么肯定是不能出现的
        // 如果上一个弹幕处于暂停状态，不需要 计算追尾
        if (
            prevBarrage &&
            this.rowGap > 0 &&
            prevBarrage.moveing &&
            !prevBarrage.paused
        ) {
          const fixTime = this.computingDuration(prevBarrage, barrage)

          // 如果需要修正时间
          if (fixTime !== null) {
            if (isRange(this.opts.times, fixTime)) {
              barrage.duration = fixTime
              barrage.isChangeDuration = true
              barrage.timeInfo.currentDuration = fixTime
            } else {
              // 如果不在范围内，就恢复初始状态，并等待下次 render
              barrage.reset()
              node.style.top = null
              manager.stashBarrages.unshift(barrage)
              return
            }
          }
        }

        node.style.opacity = 1
        node.style.pointerEvents = manager.isShow ? 'auto' : 'none'
        node.style.visibility = manager.isShow ? 'visible' : 'hidden'
        node.style.transform = `translateX(${isNegative * (containerWidth)}px)`
        node.style[transitionProp] = `transform linear ${barrage.duration}s`
        node.style[`margin${upperCase(barrage.direction)}`] = `-${width}px`

        barrage.moveing = true
        barrage.timeInfo.startTime = Date.now()
        
        callHook(barrage.hooks, 'move', [barrage, node])
        callHook(barrage.globalHooks, 'barrageMove', [barrage, node])
        resolve(whenTransitionEnds(node))
      })
    })
  }

  // 移动特殊弹幕
  moveSpecialBarrage (barrage, manager) {
    const { node, opts } = barrage

    // 先定义样式，后面的计算才会准确
    node.style.position = 'absolute'
    node.style.display = 'inline-block'
    node.style.pointerEvents = manager.isShow ? 'auto' : 'none'
    node.style.visibility = manager.isShow ? 'visible' : 'hidden'

    return new Promise(resolve => {
      const { x = 0, y = 0 } = opts.position(barrage)
      const setStyle = (a, b) => `translateX(${a}px) translateY(${b}px)`

      node.style.transform = setStyle(x, y)

      // 是否移动
      nextFrame(() => {
        // 设置弹幕的运动信息
        barrage.moveing = true
        barrage.timeInfo.startTime = Date.now()
        barrage.startPosition = { x, y }

        if (opts.direction === 'none') {
          // 如果不需要移动就使用定时器，到达时间调用 resolve
          const fn = () => {
            barrage.moveTimer.clear()
            barrage.moveTimer = null
            resolve()
          }

          let timer = setTimeout(fn, opts.duration * 1000)

          // 保存起来，以便暂停的时候清空
          barrage.moveTimer = {
            callback: fn,
            clear () {
              clearTimeout(timer)
              timer = null
            }
          }
        } else {
          const endPosition = opts.direction === 'left'
            ? this.containerWidth
            : -barrage.getWidth()

          node.style.transform = setStyle(endPosition, y)
          node.style[transitionProp] = `transform linear ${opts.duration}s`
          resolve(whenTransitionEnds(node))
        }

        callHook(barrage.hooks, 'move', [barrage, node])
        callHook(manager.opts.hooks, 'barrageMove', [barrage, node])
      })
    })
  }
}