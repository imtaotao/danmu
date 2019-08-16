import {
  callHook,
  toNumber,
  upperCase,
  nextFrame,
  lastElement,
  transitionProp,
  whenTransitionEnds,
} from './utils'

export default class RuntimeManager {
  constructor ({container, rowGap, height}) {
    const styles = getComputedStyle(container)

    if (!styles.position || styles.position === 'static') {
      container.style.position = 'relative'
    }

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
      return null
    }

    const index = this.getRandomIndex(alreadyFound)
    const currentTrajectory = this.container[index]
    const lastBarrage = lastElement(currentTrajectory.values)

    if (!lastBarrage) {
      return currentTrajectory
    }

    alreadyFound.push(index)

    // 最后一个弹幕移动超过了我们限制的距离，就允许加入新的弹幕
    if (lastBarrage.moveing) {
      const distance = lastBarrage.getMoveDistance()

      return distance > this.rowGap
        ? currentTrajectory
        : this.getTrajectory(alreadyFound)
    }

    return this.getTrajectory(alreadyFound)
  }

  // 计算追尾的时间
  computingDuration (prevBarrage, currentBarrage) {
    const acceleration = currentBarrage.getSpeed() - prevBarrage.getSpeed()
 
    // 如果加速度小于等于 0，永远不可能追上
    if (acceleration <= 0) {
      return currentBarrage.duration
    }
    const distance = prevBarrage.getMoveDistance()
    // const meetTime = 
  }

  // 移动弹幕，move 方法不应该暴露给外部，所有放在 runtime 里面
  move (barrage, isShow) {
    // 设置当前弹幕在哪一个弹道
    const node = barrage.node
    const prevBarrage = lastElement(barrage.trajectory.values)

    // 添加到轨道中去
    barrage.trajectory.values.push(barrage)
    node.style.top = `${barrage.position.y}px`

    return new Promise(resolve => {
      nextFrame(() => {
        const width = barrage.getWidth()
        const des = barrage.direction === 'left' ? 1 : -1
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
          this.computingDuration(prevBarrage, barrage)
        }

        node.style.opacity = 1
        node.style.pointerEvents = isShow ? 'auto' : 'none'
        node.style.visibility = isShow ? 'visible' : 'hidden'
        node.style.transform = `translateX(${des * (containerWidth)}px)`
        node.style[transitionProp] = `transform linear ${barrage.duration}s`
        node.style[`margin${upperCase(barrage.direction)}`] = `-${width}px`

        barrage.moveing = true
        barrage.timeInfo.startTime = Date.now()
        
        if (barrage.hooks) {
          callHook(barrage.hooks, 'barrageMove', [node, barrage])
        }

        resolve(whenTransitionEnds(node))
      })
    })
  }
}