import { assertArray } from './utils'
import BarrageManager from './manager'

function createBarrage (data = [], opts = {}) {
  assertArray(data)

  opts = Object.assign({
    hooks: {},
    limit: 20, // 页面上允许渲染的数量
    height: 50, // 弹道的高
    rowGap: 100, // 同一条轨道上两条弹幕的间隔
    capcity: 1024, // 内存中能存放的弹幕数量
    times: [8, 15], // 弹幕移动时间取值范围
    direction: 'right', // 弹幕左边出来还是右边
  }, opts)

  if (data.length > opts.capcity) {
    throw ReferenceError(`The number of barrage is greater than "${opts.capcity}".`)
  }

  return new BarrageManager(data, opts)
}

export default createBarrage