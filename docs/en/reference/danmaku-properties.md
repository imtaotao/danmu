# Danmaku Properties

Danmaku instances have many properties that record the current state of the danmaku. You can use them to make decisions and achieve your own business objectives.

## `danmaku.data`

**Type: `PushData<T>`**

`data` is the data you passed in when sending the danmaku.

```ts
manager.use({
  $createNode(danmaku) {
    console.log(danmaku.data); // { value: 1 }
  },
});

manager.push({ value: 1 });
```

## `danmaku.type`

**Type: `facile' | 'flexible'`**

The type of danmaku can be either `facile` or `flexible`. You can use this property to make different decisions.

## `danmaku.node`

**Type: `HTMLElement`**

The built-in node of the danmaku, where you can render the actual content of the danmaku.

## `danmaku.loops`

**Type: `number`**<br/>
**Default: `0`**

The playback count of the danmaku, which automatically increments by `+1` after the danmaku finishes moving. You may need this property if you have looping danmaku requirements.

## `danmaku.duration`

**Type: `number`**

The duration of the danmaku's movement.

## `danmaku.direction`

**Type: `'right' | 'left' | 'none'`**

The direction of the danmaku's movement.

## `danmaku.isFixedDuration`

**Type: `boolean`**

Used to determine whether the movement duration of the current danmaku instance has been adjusted.

## `danmaku.pluginSystem`

**Type: `PluginSystem`**

The plugin system instance for the danmaku. For its API, refer to the **hooks-plugin** documentation.

https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis
