# 弹幕初始进度

## 描述

`progress` 属性用于控制弹幕的初始进度。`progress` 是一个取值范围为 `[0, 1]` 的数值，用于设置弹幕开始播放时的起始位置。可以用于视频定位或拖拽后填充屏幕。

> [!NOTE] 提示
>
> 1. `progress` 值为 `0` 时，弹幕从起始位置开始播放（默认行为）
> 2. `progress` 值为 `1` 时，弹幕从结束位置开始播放（立即结束）
> 3. `progress` 值为 `0.5` 时，弹幕从中间位置开始播放
> 4. 仅对普通弹幕有效

## 基本用法

```ts
manager.push('这条弹幕从 30% 的位置开始', {
    progress: 0.3
});

manager.push('这条弹幕从 80% 的位置开始', {
    progress: 0.8
});
```

## 视频定位

定位后通常会清空弹幕，此时新的弹幕会从视频边缘开始滚动，导致视频中间出现一段的弹幕空挡。此时可以使用 `progress` 来发送当前播放位置之前的弹幕以填充屏幕。

```ts
const DANMAKU_DURATION = 5; // 秒

function onSeek() {
    // 清空屏幕
    manager.clear()

    // 获取从当前时间前5秒开始的弹幕列表
    const comments = getCommentsStartingAt(video.currentTime - DANMAKU_DURATION)

    comments.forEach(({time, text}) => {
        // 计算每条弹幕的进度
        const progress = (video.currentTime - comment.time) / DANMAKU_DURATION

        // 在 video.currentTime 之前的弹幕进度 > 0，
        // 所以会立即出现在屏幕中间某处而不是从边缘开始
        manager.push(text, {
            progress
        });
    })
}

video.addEventListener('seeking', onSeek)
``` 