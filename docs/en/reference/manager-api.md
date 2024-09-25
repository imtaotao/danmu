# Manager API

> [!NOTE] Unit Hint
> All units involved in the calculation can be computed through expressions, similar to CSS `calc`.
>
> 1. **`number`**: The default unit is `px`.
> 2. **`string`**: Expression calculation. Supports mathematical operations (`+`, `-`, `*`, `/`), and only `%` and `px` units are supported.
>
> ```ts
> manager.setGap('(100% - 10px) / 5');
> ```

## `manager.canPush()`

**Type: `(type: DanmakuType) => boolean`**

Determines whether danmaku can be added. If the memory limit threshold or the rendering quantity threshold is exceeded, adding will be prevented. You can change this by calling `manager.setLimits()`.

```ts
// Determine if a facile danmaku can be pushed currently
manager.canPush('facile');

// Determine if a flexible danmaku can be pushed currently
manager.canPush('flexible');
```

## `manager.push()`

**Type: `(data: T, options?: PushOptions<T>) => boolean`**

Send a danmaku. This danmaku will be placed in the memory array waiting to be rendered. This is not necessarily rendered immediately; it depends on the rendering algorithm you have set. You can change this by calling `manager.setMode()`. This will trigger the `push` hook.

> [!NOTE] Note
>
> 1. When sending danmaku, **the data format must be `T`**. The type of `T` is controlled by you, as long as you can correctly retrieve it during rendering. See the example below for details.
> 2. If the second parameter is not passed, or if some parameters are not passed, the default values will be taken from `manager.options`.

```ts
export interface PushOptions<T> {
  id?: number | string;
  rate?: number;
  duration?: number;
  plugin?: DanmakuPlugin<T>;
  direction?: 'right' | 'left';
}
```

**Simple case:**

```ts
import { create } from 'danmu';

const manager = create<string>();

// Send a danmaku.
// Time, speed, direction, and other configurations reuse the global parameters passed during `create()`.
manager.push('content');
```

**Complete case:**

```ts
import { create } from 'danmu';

const manager = create<{ content: string }>();

// Send a danmaku and add plugin processing. The scope of the plugin is limited to the current pushed danmaku.
manager.push(
  { content: 'content' },
  {
    id: 1, // If your danmaku has an id, you can add it here
    rate: 1.5,
    duration: 1000,
    direction: 'left',
    plugin: {
      createNode(danmaku) {
        const div = document.createElement('div');
        div.innerHTML = danmaku.data.content; // 弹幕内容
        danmaku.node.appendChild(div);
      },
    },
  },
);
```

## `manager.unshift()`

**Type: `(data: T, options?: PushOptions<T>) => boolean`**

The `push` method adds to the end of the memory array. This method will **add the danmaku to the front of the memory array**. When a user inputs a danmaku and clicks send, you should use this method to ensure that the danmaku **renders immediately** on the next polling. The usage is the same as the `push` method and will trigger the `push` hook.

## `manager.pushFlexibleDanmaku()`

**Type: `(data: T, options?: PushFlexOptions<T>) => boolean`**

Send a flexible danmaku. **Flexible danmaku will render on the next polling** and will trigger the `push` hook.

> [!NOTE] Flexible Danmaku Explanation
>
> 1. The `options` for flexible danmaku behave the same as the `options` for facile danmaku. If not provided, default values will be taken from `manager.options`.
> 2. Flexible danmaku **must pass `position` to specify the location**. If you need to specify rendering on a particular track, you can use [**`getTrackLocation()`**](#manager-gettracklocation) to achieve this.

```ts
import { create } from 'danmu';

interface Position {
  x: number;
  y: number;
}

interface PushFlexOptions {
  id?: number | string;
  rate?: number;
  duration?: number;
  plugin?: DanmakuPlugin<T>;
  direction?: 'left' | 'right' | 'none'; // Facile danmaku does not have 'none'
  position:
    | Position
    | ((danmaku: Danmaku<T>, container: Container) => Position);
}

const manager = create<string>();

// Send a danmaku, positioned at the center of the container, stationary for 5s
manager.pushFlexibleDanmaku('content', {
  duration: 5000,
  direction: 'none',
  position(danmaku, container) {
    // Or use the string expression `50% - (${danmaku.getWidth()} / 2)`
    return {
      x: (container.width - danmaku.getWidth()) * 0.5,
      y: (container.height - danmaku.getHeight()) * 0.5,
    };
  },
});
```

## `manager.getTrackLocation()`

**Type: `(i: number) => { start: number, middle: number, end: number }`**

Used to get the position information of a specific track, **the unit is `px`, and it is the data for the Y-axis**. **If `i` is a positive integer, it retrieves the position information of `track[i]`. If it is a negative integer, it retrieves from the end.**

> [!NOTE] Hint
> The index starts from **`0`** by default, meaning if you pass `0`, it retrieves the data for the first track.

**Example:**

```ts
// Get the position information of the first track
const { start, middle, end } = manager.getTrackLocation(0);

// Get the position information of the last track
const { start, middle, end } = manager.getTrackLocation(-1);
```

> [!NOTE] Hint
> When sending flexible danmaku, if you need to send it to a specific track, this method can be very useful. The position information for facile danmaku is calculated as follows and will render in the center of the track. If you want to keep it the same as facile danmaku, perhaps the same algorithm is used.
>
> > 1. For the height of the danmaku, if you can obtain it without calculation, you do not need to use the `getHeight()` method.
> > 2. Ensure that the track you are accessing exists; otherwise, an error will occur. You can check this using `manager.trackCount`.
> > 3. You can open the browser console in our online [**demo**](https://imtaotao.github.io/danmu/) and enter this code to see the effect.

```ts {9,12}
// Send a flexible danmaku
manager.pushFlexibleDanmaku(
  { content: 'content' },
  {
    duration: 5000,
    direction: 'none',
    position(danmaku, container) {
      // Render in the 4th track
      const { middle } = manager.getTrackLocation(3);
      return {
        x: (container.width - danmaku.getWidth()) * 0.5,
        y: middle - danmaku.getHeight() / 2,
      };
    },
  },
);
```

## `manager.clearTrack()`

**Type: `(i: number) => void`**

Used to clear the danmaku rendered on a specific track. **If `i` is a positive integer, it clears the danmaku on `track[i]`. If it is a negative integer, it clears from the end.**

**Example:**

```ts
// Clear the danmaku on the first track
manager.clearTrack(0);

// Clear the danmaku on the last track
manager.clearTrack(-1);
```

## `manager.len()`

**Type: `() => { stash: number; flexible: number; view: number; all: number }`**

Returns the current number of danmaku states in the rendering engine, which changes in real-time.

- **`all`**: The total number of danmaku, including those in memory and those being rendered.
- **`view`**: The number of danmaku currently being rendered, including both facile danmaku and flexible danmaku.
- **`stash`**: The number of facile danmaku currently stored in the memory area.
- **`flexible`**: The number of flexible danmaku, including those being rendered and those in the memory area.

```ts
const { stash, flexible, view, all } = manager.len();
```

## `manager.each()`

**Type: `(fn: (danmaku: Danmaku<T>) => boolean | void) => void`**

Performs **synchronous iteration** over the currently rendering danmaku. The iteration will terminate if the callback function returns `false`.

## `manager.asyncEach()`

**Type: `(fn: (danmaku: Danmaku<T>) => boolean | void) => Promise<void>`**

Performs **asynchronous iteration** over the currently rendering danmaku. The iteration will terminate if the callback function returns `false`.

> [!NOTE] Difference from `each`
> The `asyncEach` method performs time slicing. This means that when there are too many danmaku being rendered, the long execution time of the code during iteration may cause some blocking of the main thread. Time slicing helps alleviate this issue.

## `manager.mount()`

**Type: `(node?: HTMLElement | string, { clear?: boolean }) => void`**

Mounts the danmaku container of the kernel to an `HTML node`. This can be a `string` type CSS selector. The `clear` parameter can be used to clear previously rendered danmaku, and it defaults to `true`. If you do not want to clear, you can pass `false`. After mounting, you can access this node through `manager.container.parentNode`.

> [!NOTE] Difference from the container node
> The container node is the node where all danmaku are rendered. When we adjust it through `manager.setArea()`, we are modifying the container node. However, the container node **needs to be mounted to a specific DOM**. This is the distinction between them. The width and height of the container node are both `100%`.

```ts
manager.mount('#root');

// Or
manager.mount('#root', { clear: false });
```

## `manager.unmount()`

**Type: `() => void`**

Unmounts the danmaku container from the currently mounted node. After unmounting, when you access `manager.container`, it will return `null`.

```ts
manager.unmount();
```

## `manager.clear()`

**Type: `() => void`**

Clears the currently rendered and in-memory danmaku, triggering the `clear` hook.

## `manager.updateOptions()`

**Type: `(newOptions: Partial<ManagerOptions>) => void`**

Updates `manager.options`. If it involves changes in spacing and dimensions, it will automatically format and trigger the `updateOptions` hook. You can access the updated `options` within this hook.

## `manager.startPlaying()`

**Type: `() => void`**

Starts the rendering engine. The kernel will start a timer to poll for rendering. This will trigger the `start` hook.

## `manager.stopPlaying()`

**Type: `() => void`**

Stops the rendering engine, and the kernel timer will also be cleared. This will trigger the `stop` hook.

## `manager.hide()`

**Type: `() => Promise<Manager>`**

Hides the currently rendered danmaku, and any newly rendered danmaku will also be hidden. This will trigger the `hide` hook.

## `manager.show()`

**Type: `() => Promise<Manager>`**

Shows the currently hidden danmaku. This will trigger the `show` hook.

## `manager.nextFrame()`

**Type: `(fn: FrameRequestCallback) => void`**

This is a utility method, and the callback function will be triggered in the next frame.

```ts
manager.nextFrame(() => {
  // .
});
```

## `manager.updateOccludedUrl()`

**Type: `(url?: string, el?: string | HTMLElement) => void`**

Adds a mask to the specified element (default is the current danmaku container `manager.container.node`) **to implement the anti-occlusion feature**. If `url` is not provided, it means canceling the mask. You can specify the DOM node you need by passing a second parameter.

> [!NOTE] Note
> The anti-occlusion feature requires you to continuously call `manager.updateOccludedUrl('url')` to update the mask. The mask image is generally based on the backend's response (it may be calculated by AI technology to determine the areas of the video that need anti-occlusion, but the actual implementation depends on the business requirements).

## `manager.render()`

**Type: `() => void`**

Skips waiting for the next polling and renders immediately. If you have sent a danmaku and do not want to wait for the next polling but want it to render immediately, you can use this method.

```ts
manager.unshift('content');

// Render immediately
manager.render();
```

## `manager.remove()`

**Type: `(pluginName: string) => void`**

Removes a specific plugin from the current `manager` instance, but you must specify the plugin name.

## `manager.use()`

**Type: `(plugin: ManagerPlugin<T> | ((m: this) => ManagerPlugin<T>)) => ManagerPlugin<T>`**

Registers a plugin to the current `manager` instance and returns the plugin instance. If you need to remove the plugin later, you can save the plugin's `name`. If not provided, a `uuid` format `name` will be assigned by default.

**If `name` is provided:**

```ts
const plugin = manager.use({
  name: 'test-plugin',
  // .
});
console.log(plugin.name); // 'test-plugin'
```

**If `name` is not provided:**

```ts
const plugin = manager.use({
  // .
});
console.log(plugin.name); // uuid
```

## `manager.isShow()`

**Type: `() => boolean`**

Used to determine whether the current danmaku is in the `shown` state. Typically, after you call `manager.show()`, calling this method will return `true`.

## `manager.isFreeze()`

**Type: `() => boolean`**

Used to determine whether the current danmaku is in the `frozen` state. Typically, after you call `manager.freeze()`, calling this method will return `true`.

## `manager.isPlaying()`

**Type: `() => boolean`**

Used to determine whether the current rendering engine is in the rendering play state. After you call `manager.stopPlaying()`, it will return `false`.

## `manager.isDanmaku()`

**Type: `(b: unknown) => b is Danmaku<T>`**

Used to determine whether a value is a danmaku instance.

## `manager.setArea()`

**Type: `(data: AreaOptions) => void`**

Sets the size of the current container (`manager.container.node`) and will automatically format. For usage, refer to the [**demo**](https://github.com/imtaotao/danmu/blob/master/demo/src/components/sidebar/SidebarAreaY.tsx#L26-L31).

```ts
interface AreaOptions {
  x?: {
    start?: string | number;
    end?: string | number;
  };
  y?: {
    start?: string | number;
    end?: string | number;
  };
}
```

## `manager.setOpacity()`

**Type: `(opacity: number | string) => void`**

Sets the **opacity** of the current danmaku and subsequent rendered danmaku. If the parameter is a `string`, it will be automatically converted to a `number`.

## `manager.setStyle()`

**Type: `(key: StyleKey, val: CSSStyleDeclaration[StyleKey]) => void`**

Sets the **CSS style** of the current danmaku and subsequent rendered danmaku.

## `manager.setRate()`

**Type: `(rate: number) => void`**

Sets the **speed** of subsequent rendered danmaku. This is a syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

## `manager.setMode()`

**Type: `(mode: 'none' | 'strict' | 'adaptive') => void`**

Sets the **collision detection algorithm** for subsequent rendered danmaku. This is a syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

## `manager.setGap()`

**Type: `(gap: number | string) => void`**

Sets the **horizontal spacing** between subsequent rendered danmaku. This is a syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

## `manager.setDurationRange()`

**Type: `(durationRange: [number, number]) => void`**

Sets the **motion duration range** for subsequent rendered danmaku. This is a syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

## `manager.setLimits()`

**Type: `(limits: { view?: number; stash?: number }) => void`**

Set the **number of danmaku to limit in the memory area and rendering area**. The default `stash` quantity is `Infinity`, which means no limit. You can set it to a new value for flexible adjustment. It is syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

## `manager.setInterval()`

**Type: `(interval: number) => void`**

Sets the **polling time** of the rendering engine. This is a syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

## `manager.setDirection()`

**Type: `(direction: 'left' | 'right') => void`**

Sets the **direction** for subsequent rendered danmaku. This is a syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

## `manager.setTrackHeight()`

**Type: `(trackHeight: number | string) => void`**

Sets the **track height**. This is a syntactic sugar for `manager.updateOptions()` and will trigger the `updateOptions` hook.

> [!NOTE] Track Height Setting Rule
> The track height should generally be set to **greater than or equal to the height of the danmaku**, otherwise, there will be overlapping danmaku.

```ts
// This will only have 3 tracks
manager.setTrackHeight('33%');

// Track height is 100px, and the number of tracks is `container height / 100px`
manager.setTrackHeight(100);
```
