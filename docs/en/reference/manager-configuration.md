# Manager Configuration

When initializing the `manager`, you can pass global options to override the default configuration. All of the following options are **optional**.

> [!NOTE] Tip
> These are global properties. When sending danmaku, if some optional properties are not provided, **the global properties here will be used by default**.

**Example:**

```ts {16}
interface CreateOption {
  rate?: number;
  interval?: number;
  gap?: number | string;
  durationRange?: [number, number];
  trackHeight?: number | string;
  plugin?: ManagerPlugin;
  limits?: {
    view?: number;
    stash?: number;
  };
  direction?: 'right' | 'left';
  mode?: 'none' | 'strict' | 'adaptive';
}

export declare function create(options?: CreateOption): Manager;
```

Except for `plugin`, all parameters can be set either **when creating the `manager`** or **through the API**.

**Example:**

```ts
import { create } from 'danmu';

// 1. Set during initialization
const manager = create({ rate: 1 });

// 2. Change through the API
manager.setRate(1);
```

## `config.mode`

**Type: `'none' | 'strict' | 'adaptive'`**<br/>
**Default: `'strict'`**

Used to determine the kernel's **collision detection algorithm**. **If your use case is live streaming or video playback, you should set it to `adaptive`. This will minimize danmaku collisions while ensuring real-time rendering.**

- **`none`** No collision detection; danmaku will render immediately.
- **`strict`** Strict collision detection; rendering will be delayed if conditions are not met.
- **`adaptive`** Attempts collision detection while ensuring immediate rendering (recommended).

## `config.rate`

**Type: `number`**<br/>
**Default: `1`**

Used to set the movement speed of the danmaku. The original movement speed of the danmaku will be multiplied by this `rate` factor.

## `config.gap`

**Type: `number | string`**<br/>
**Default: `0`**

The minimum distance between the trailing danmaku and the leading danmaku on the same track during collision detection. **You cannot set a value less than `0`. If a `string` type is passed, it represents a percentage, but it must follow the `10%` syntax**. This only takes effect when the danmaku hits collision detection.

**Example:**

```ts
manager.setGap(100); // Minimum distance is 100px
manager.setGap('10%'); // // Minimum distance is 10% of the container width
```

## `config.interval`

**Type: `number`**<br/>
**Default: `500`**

The frequency of the kernel's polling for rendering, defaulting to once every `500ms`. You can adjust this to an appropriate value based on your business requirements. Essentially, this is the `setTimeout` interval.

## `config.direction`

**Type: `string`**<br/>
**Default: `'right'`**

The movement direction of the danmaku, which defaults to moving from right to left. **Regular danmaku cannot have a `none` value, but advanced danmaku can be set to `none`**. If a danmaku has its own `direction` when sent, it will use its own configuration.

## `config.trackHeight`

**Type: `number | string`**<br/>
**Default: `'20%'`**

Track height. If the value passed is of type `number`, it defaults to `px`. If the value passed is of type `string`, it must follow the `10%` syntax, representing a percentage height based on the container.

**Example:**

```ts
manager.setTrackHeight(100); // Height is 100px
manager.setTrackHeight('33%'); // Height is 33% of the container height
```

## `config.durationRange`

**Type: `[number, number]`**<br/>
**Default: `[4000, 6000]`**

The movement duration for regular danmaku. This is a range value, and **regular danmaku will randomly choose a time within this range as the movement duration**. If you want all danmaku to have the same movement duration, you can set both numbers to the same value. If a danmaku has its own `duration` when sent, it will use its own configuration.

## `config.limits`

**Type: `{ view?: number; stash?: number }`**<br/>
**Default: `{ stash: Infinity }`**

> [!NOTE] Tip
> This parameter limits the number of danmaku rendered, with the default values for both memory and view being **unlimited**.

- `view` limits the number of danmaku rendered in the container. If this limit is exceeded, regular danmaku will be stored in memory, waiting for an appropriate time to render, while advanced danmaku will be discarded.

- `stash` limits the number of danmaku stored in memory. If this limit is exceeded, they will be discarded and an alert will be triggered or a plugin hook will be called. You can adjust this parameter as needed.

## `config.plugin`

**Type: `ManagerPlugin<unknown> | Array<ManagerPlugin<unknown>>`**<br/>
**Default: `undefined`**

The default `managerPlugin` when creating a `manager`. If you need to register new plugins, you can use the `manager.use` method. For more details, refer to the [**manager hooks**](./manager-hooks) and [**writing plugins**](../guide/create-plugin) sections.

**Example:**

```ts
import { create } from 'danmu';

const manager = create({
  plugin: {
    // .
    start() {},
    stop() {},
  },
});
```

**Pass as an array:**

```ts
// You can also pass it as an array,
// which allows you to control the order when adding other plugins
const manager = create({
  plugin: [
    // .
    {
      // .
      start() {},
      stop() {},
    },
  ],
});
```
