# 以下是 BarrageManager 类的相关 API 和 Options 介绍

## 属性
### `runing: boolean`

### `length: number`

### `specialLength: number`

### `showLength: number`

### `stashLength: number`

### `containerWidth: number`

### `containerHeight: number`


## API
### `send(barrageData: any | Array<any>) : boolean`

### `sendSpecial(specialBarrageData: any | Array<any>) : boolean`

### `show() : void`

### `hidden() : void`

### `each(cb: Function) : void`

### `start() : void`

### `stop() : void`

### `setOptions(opts: Options) : void`

### `resize() : void`

### `clear() : void`

### `clone(opts?: Options) : barrageManager`


## Options
### `limit: number`

### `height: number`

### `rowGap: number`

### `isShow: boolean`

### `capacity: number`

### `times: Array<number>`

### `interval: number`

### `direction: 'left' | 'right'`

### `hooks: Object`


## Hooks
### `barrageCreate(barrage: Barrage, node: HTMLElement)`

### `barrageAppend(barrage: Barrage, node: HTMLElement)`

### `barrageRemove(barrage: Barrage, node: HTMLElement)`

### `barrageDestroy(barrage: Barrage, node: HTMLElement)`

### `send(manager: barrageManager, data: any)`

### `sendSpecial(manager: barrageManager, data: any)`

### `show(manager: barrageManager)`

### `hidden(manager: barrageManager)`

### `start(manager: barrageManager)`

### `stop(manager: barrageManager)`

### `resize(manager: barrageManager)`

### `clear(manager: barrageManager)`

### `setOptions(manager: barrageManager, options: Options)`

### `render(manager: barrageManager)`

### `ended(manager: barrageManager)`