import Timeline from './timeline'
import BarrageManager from './manager'

function createBarrageManager (opts = {}) {
  opts = Object.assign({
    hooks: {}, // 钩子函数
    limit: 100, // 页面上允许渲染的弹幕数量
    height: 50, // 轨道道的高
    rowGap: 50, // ：同一条轨道上两条弹幕的起始间隔
    isShow: true, // 默认 show
    capacity: 1024, // 内存中能存放的弹幕数量
    times: [5, 10], // 弹幕移动时间取值范围
    interval: 1, // 渲染频率，默认 1s 一次
    direction: 'right', // 弹幕左边出来还是右边
    forceRender: false, // 是否去掉其他限制，强制显示，这个可以配合使用，用于碰撞检测的优化
  }, opts)

  return new BarrageManager(opts)
}

// 以后可能增加新的 api
export default {
  Timeline,
  create: createBarrageManager,
}