import { nextFrame, transitionProp, whenTransitionEnds } from './utils'

export default class RuntimeManager {
  constructor ({container, rowGap = 0, height = 60}) {
    const styles = getComputedStyle(container)

    if (!styles.position || styles.position === 'static') {
      container.style.position = 'relative'
    }

    this.rowGap = rowGap
    this.singleHeight = height
    this.containerWidth = parseInt(styles.width)
    this.containerHeight = parseInt(styles.height)
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

    // 计算最后一个弹幕移动了多远
    // 如果超过了我们限制的距离，就允许加入新的弹幕
    const duration = lastBarrage.duration
    const startTime = lastBarrage.position.startTime

    // 如果没有开始时间，代表还没有开始移动
    if (startTime !== null) {
      const precent = (Date.now() - startTime) / 1000 / duration
      // 移动的距离 + 弹幕本身的宽度
      const distance = precent * this.containerWidth

      // 两个弹幕之间允许的弹幕间距
      return distance > this.rowGap
        ? currentTragectory
        : this.getTrajectory(alreadyFound)
    }

    return this.getTrajectory(alreadyFound)
  }

  // 移动弹幕
  async move (barrage, isShow) {
    // 设置当前弹幕在哪一个弹道
    const node = barrage.node
    const width = await barrage.width()
    node.style.top = `${barrage.position.y}px`
    node.style.transform = `translateX(${width}px)`

    return new Promise(resolve => {
      nextFrame(() => { 
        node.style.display = isShow ? 'inline-block' : 'none'
        node.style[transitionProp] = `transform linear ${barrage.duration}s`
        node.style.transform = `translateX(-${this.containerWidth}px)`

        barrage.moveing = true
        barrage.position.startTime = Date.now()
        resolve(whenTransitionEnds(node))
      })
    })
  }
}