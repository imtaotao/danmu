# 弹幕属性

弹幕实例里面有很多用来记录当前弹幕状态的属性，你可以用他们来做一些判断，实现自己的业务目的。


## `danmaku.data`

**类型：`PushData<T>`**

`data` 是你在发送数据时传入的数据。

```ts
manager.use({
  $createNode(danmaku) {
    console.log(danmaku.data); // { value: 1 }
  },
});

manager.push({ value: 1 });
```


## `danmaku.type`

**类型：`facile' | 'flexible'`**

弹幕的类型，分为普通弹幕和高级弹幕，普通弹幕的类型为 `facile`，你可以根据此属性来判断做不同的处理。


## `danmaku.node`

**类型：`HTMLElement`**

弹幕的内置节点，你可以往这个节点里面渲染真正的弹幕内容。


## `danmaku.loops`

**类型：`number`**<br/>
**默认值：`0`**

弹幕的播放次数，弹幕运动结束后会自动 `+1`，如果你有循环弹幕的需求，可能需要此属性。


## `danmaku.duration`

**类型：`number`**

弹幕的运动时长。


## `danmaku.direction`

**类型：`'right' | 'left' | 'none'`**

弹幕的运动方向。


## `danmaku.isFixedDuration`

**类型：`boolean`**

用于判断当前弹幕实例是否被修正过运动时间。


## `danmaku.pluginSystem`

**类型：`PluginSystem`**

弹幕的插件系统实例，其 api 可以见 **hooks-plugin** 的文档。

https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis
