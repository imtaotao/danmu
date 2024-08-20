# 发送循环弹幕

## 描述

本章节将举例介绍如何发送一个循环播放的弹幕。普通弹幕的循环有两种不同的模式。

> [!NOTE] 提示
> 1. 通过 [**`setloop`**](../reference/danmaku-methods/#danmaku-setloop) 来实现，这种模式在除第一次之外的循环播放次数中，**不会参与碰撞计算。**
> 2. 通过 [**`destroy`**](../reference/danmaku-hooks/#hooks-destroy) 钩子来递归实现，这种方式会让弹幕的循环播放**参与碰撞计算，但是循环播放的运动时间可能会不一致。**


### 通过 `setloop` 来实现

添加全局钩子这会对所有的弹幕生效

```ts {5,11}
const manager = create<string>({
  plugin: {
    $moveStart(danmaku) {
      // 设置循环
      danmaku.setloop();
    },

    $moveEnd(danmaku) {
      // 循环播放 3 次后，终止循环播放
      if (danmaku.loops >= 3) {
        danmaku.unloop();
      }
    },
  },
});
```

通过添加弹幕自身的插件可以只对某一个弹幕生效。

> 你可以复制下面这段代码，然后粘贴在在线 [**demo**](https://imtaotao.github.io/danmu/) 的控制台上查看效果。

```ts {5,11}
manager.push('弹幕内容', {
  plugin: {
    moveStart(danmaku) {
      // 设置循环
      danmaku.setloop();
    },

    moveEnd(danmaku) {
      // 循环播放 3 次后，终止循环播放
      if (danmaku.loops >= 3) {
        danmaku.unloop();
      }
    },
  },
});
```

### 通过递归来实现循环播放

上面一种实现方式是借助官方提供的 api 来实现的，不过你也可以自己来递归实现。

> [!NOTE] 提示
> **高级弹幕不会参与碰撞计算，所以如果是高级弹幕的场景，不要通过这种方式来实现，使用 `setloop` 即可。**
>> 你可以复制下面这段代码，然后粘贴在在线 [**demo**](https://imtaotao.github.io/danmu/) 的控制台上查看效果。

```ts {7,11,15}
let loops = 0;

manager.push('弹幕内容', {
  plugin: {
    destroy(danmaku, mark) {
      // 循环播放 3 次后，终止循环播放
      if (++loops >= 3) return;

      // 如果你是通过手动调用 destroy 方法来触发的钩子
      // 可以通过 danmaku.destroy('mark') 传递 mark 来判断一下
      if (mark === 'mark') return;

      // 如果你有对内存和视图做限，可能会导致发送失败
      // 你可以调用 manager.canPush('facile') 来判断
      manager.unshift(danmaku);
    },
  },
}),
```
