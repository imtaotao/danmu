// timeline 就是一个小的观察者模式
export default function Timeline (manager, opts = {}) {
  const { limit, forceRender } = manager.opts
  if (opts.forceRender) {
    manager.setOptions({
      limit: Infinity,
      forceRender: true,
    })
  }

  return {
    preEmiter: null,
    timeStore: {},
    specialTimeStore: {},

    add (timestamp, cfg, hooks, isForward) {
      if (!this.timeStore[timestamp]) {
        this.timeStore[timestamp] = [{ cfg, hooks, isForward }]
      } else {
        this.timeStore[timestamp].push({ cfg, hooks, isForward })
      }
    },
  
    addSpecial (timestamp, cfg) {
      if (!this.specialTimeStore[timestamp]) {
        this.specialTimeStore[timestamp] = [cfg]
      } else {
        this.specialTimeStore[timestamp].push(cfg)
      }
    },
  
    emit (timestamp, clearOld) {
      const ordinaryData = this.timeStore[timestamp]
      const specialData = this.specialTimeStore[timestamp]

      if (ordinaryData) {
        ordinaryData.forEach(({ cfg, hooks, isForward }) => {
          manager.send(cfg, hooks, isForward)
        })
      }
      if (specialData) {
        manager.sendSpecial(specialData)
      }

      // 如果需要清空的话
      if (clearOld) {
        const clear = data => {
          const keys = Object.keys(data)
          if (keys.length > 0) {
            for (let i = 0; i < keys.length; i++) {
              const time = keys[i]
              // 如果比当前时间小，代表可能是渲染过的
              if (time < timestamp && data[time]) {
                delete data[time]
              }
            }
          }
        }
        clear(this.timeStore)
        clear(this.specialTimeStore)
      }
    },

    emitInterval(timestamp, clearOld) {
      if (timestamp !== preEmiter) {
        // 保存这一次的
        this.preEmiter = timestamp
        this.emit(timestamp, clearOld)
      }
    },

    destroy() {
      this.preEmiter = null
      this.timeStore = {}
      this.specialTimeStore = {}
      manager.setOptions({
        limit,
        forceRender,
      })
    },
  }
}