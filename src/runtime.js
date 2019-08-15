import {
  toNumber,
  upperCase,
  nextFrame,
  transitionProp,
  whenTransitionEnds,
} from './utils'

export default class RuntimeManager {
  constructor ({container, rowGap = 0, height = 60}) {
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
      // 把原先的移进来
      if (this.container[i]) {
        container.push(this.container[i])
      } else {
        // 新的轨道
        const start = this.singleHeight * i
        const end = this.singleHeight * (i + 1) - 1

        container.push({
          values: [],
          gaps: [start, end],
        })
      }
    }

    this.container = container
  }

  getTrajectory (alreadyFound = []) {
    // 如果发现全部都找过了，则代表没有合适的弹道可以选择
    if (alreadyFound.length === this.container.length) {
      return null
    }

    const getIndex = () => {
      const randomIndex = Math.floor(Math.random() * this.rows)
      return alreadyFound.includes(randomIndex)
        ? getIndex()
        : randomIndex
    }

    const index = getIndex()
    const currentTragectory = this.container[index]
    const lastBarrage = currentTragectory.values[currentTragectory.values.length - 1]
    
    if (!lastBarrage) {
      return currentTragectory
    }

    alreadyFound.push(index)

    // 最后一个弹幕移动超过了我们限制的距离，就允许加入新的弹幕
    if (lastBarrage.moveing) {
      const distance = lastBarrage.getMoveDistance()

      return distance > this.rowGap
        ? currentTragectory
        : this.getTrajectory(alreadyFound)
    }

    return this.getTrajectory(alreadyFound)
  }

  // 移动弹幕，move 方法不应该暴露给外部，所有放在 runtime 里面
  move (barrage, isShow) {
    // 设置当前弹幕在哪一个弹道
    const node = barrage.node
    node.style.top = `${barrage.position.y}px`

    return new Promise(resolve => {
      nextFrame(() => {
        const fn = w => {
          const des = barrage.direction === 'left' ? 1 : -1
          const containerWidth = this.containerWidth + w

          node.style.opacity = 1
          node.style.pointerEvents = isShow ? 'auto' : 'none'
          node.style.visibility = isShow ? 'visible' : 'hidden'
          node.style.transform = `translateX(${des * (containerWidth)}px)`
          node.style[transitionProp] = `transform linear ${barrage.duration}s`
          node.style[`margin${upperCase(barrage.direction)}`] = `-${barrage.width}px`

          barrage.moveing = true
          barrage.timeInfo.startTime = Date.now()

          resolve(whenTransitionEnds(node))
        }

        // 得到高度
        if (!barrage.width) {
          barrage.getWidth().then(fn)
        } else {
          fn(barrage.width)
        }
      })
    })
  }
}