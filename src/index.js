import BarrageManager from './manager'

function createBarrage (opts = {}) {
  opts = Object.assign({
    hooks: {}, // 钩子函数
    limit: 50, // 页面上允许渲染的数量
    height: 50, // 弹道的高
    rowGap: 50, // 同一条轨道上两条弹幕的间隔
    isShow: true, // 默认 show
    capcity: 1024, // 内存中能存放的弹幕数量
    times: [8, 15], // 弹幕移动时间取值范围
    interval: 2000, // 轮询间隔时间
    direction: 'right', // 弹幕左边出来还是右边
  }, opts)

  return new BarrageManager(opts)
}

export default createBarrage