# Send Looping Danmaku

## Description

This section will provide examples on how to send a looping danmaku. There are two different modes for looping facile danmaku.

> [!NOTE] Hint
>
> 1. Implemented through [**`setloop`**](../reference/danmaku-methods/#danmaku-setloop). In this mode, the danmaku **will not participate in collision detection** during the looping playback, except for the first time.
> 2. Implemented recursively through the [**`destroy`**](../reference/danmaku-hooks/#hooks-destroy) hook. This method will allow the looping danmaku to **participate in collision detection**, but the motion time of the looping playback may be inconsistent.

### Implementation via `setloop()`

Adding a global hook will affect all danmaku.

```ts {5,11}
const manager = create<string>({
  plugin: {
    $moveStart(danmaku) {
      // Set loop
      danmaku.setloop();
    },

    $moveEnd(danmaku) {
      // Stop loop playback after 3 looping
      if (danmaku.loops >= 3) {
        danmaku.unloop();
      }
    },
  },
});
```

By adding a plugin to the danmaku itself, you can make it effective for only a specific danmaku.

> You can copy the following code and paste it into the console of the online [**demo**](https://imtaotao.github.io/danmu/) to see the effect.

```ts {5,11}
manager.push('content', {
  plugin: {
    moveStart(danmaku) {
      // Set loop
      danmaku.setloop();
    },

    moveEnd(danmaku) {
      // Stop loop playback after 3 looping
      if (danmaku.loops >= 3) {
        danmaku.unloop();
      }
    },
  },
});
```

### Implementing Loop Playback via Recursion

The above implementation leverages the official API, but you can also implement it recursively yourself.

> [!NOTE] Hint
> **Flexible danmaku will not participate in collision detection, so if you are dealing with flexible danmaku, do not use this method. Instead, use `setloop`.**
>
> > You can copy the following code and paste it into the console of the online [**demo**](https://imtaotao.github.io/danmu/) to see the effect.

```ts {7,11,15}
let loops = 0;

manager.push('content', {
  plugin: {
    destroy(danmaku, mark) {
      // Stop loop playback after 3 looping
      if (++loops >= 3) return;

      // If you are triggering the hook by manually calling the destroy method
      // You can pass a mark via `danmaku.destroy('mark')` to make a judgment
      if (mark === 'mark') return;

      // If you have limits on memory and view, it may cause the send to fail
      // You can call `manager.canPush('facile')` to check
      manager.unshift(danmaku);
    },
  },
}),
```
