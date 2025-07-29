# Danmaku Initial Progress

## Description

The `progress` property controls the initial progress of danmaku. `progress` is a value ranging from `[0, 1]` that
sets the starting position when the danmaku begins playing. This is useful for "prefilling" the screen when seeking or
scrubbing in a video.

> [!NOTE] Hint
>
> 1. When `progress` is `0`, the danmaku starts from the beginning (default behavior)
> 2. When `progress` is `1`, the danmaku starts from the end (finishes immediately)
> 3. When `progress` is `0.5`, the danmaku starts at the halfway point
> 4. This is only useful for facile danmaku

## Basic Usage

```ts
manager.push('This danmaku starts from 30%', {
    progress: 0.3
});

manager.push('This danmaku starts from 80%', {
    progress: 0.8
});
```

## Emitting Danmaku After a Seek

After a seek operation, you may want to emit danmaku that starts at a specific time relative to the current playback
position. This can be achieved by calculating the `progress` based on the current time and the desired start time of the
danmaku.

```ts
const DANMAKU_DURATION = 5; // seconds

function onSeek() {
    // clear all existing danmaku
    manager.clear()

    // get a list of danmaku starting at 5 seconds before the current time
    const danmakus = getDanmakuStartingAt(video.currentTime - DANMAKU_DURATION)

    danmakus.forEach(({time, text}) => {
        // compute the progress for each danmaku
        const progress = (video.currentTime - comment.time) / DANMAKU_DURATION

        // The ones that are before video.currentTime will have progress > 0, 
        // so they will appear immediately in the middle of the screen instead of the edges
        manager.push(text, {
            progress
        });
    })
}

video.addEventListener('seeking', onSeek)
```