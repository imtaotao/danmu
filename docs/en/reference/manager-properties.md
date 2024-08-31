# Manager Properties

> [!NOTE] Unit Hint
> All units involved in the calculation can be computed through expressions, similar to CSS `calc`.
>
> 1. **`number`**: The default unit is `px`.
> 2. **`string`**: Expression calculation. Supports mathematical operations (`+`, `-`, `*`, `/`), and only `%` and `px` units are supported.
>
> ```ts
> manager.setGap('(100% - 10px) / 5');
> ```

## `manager.version`

**Type: `string`**

The current version of the `danmu` library.

## `manager.options`

**Type: `ManagerOptions`**

[**`manager.options`**](./manager-configuration), you can get some initial values from here and use them.

```ts
console.log(manager.options.times); // [number, number]
```

## `manager.statuses`

**Type: `Record<PropertyKey, unknown>`**

A property for recording states, not used by the kernel. It is mainly provided for business purposes to record some states. The default type is `Record<PropertyKey, unknown>`, but you can pass a generic type when creating the `manager`.

```ts {3}
import { create } from 'danmu';

const manager = create<unknown, { background: string }>();

manager.statuses; // Type is `{ background: string }`
```

## `manager.trackCount`

**Type: `number`**

The current number of tracks inside the container. When the container size changes and after `format` (either by manually calling the `format()` method or by calling the `setArea()` method), the `trackCount` will also change accordingly.

## `manager.pluginSystem`

**Type: `PluginSystem`**

The plugin system instance of `manager`, its API can be found in the **hooks-plugin** documentation.

https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis

<h2></h2>

**The danmaku container instance has the following properties and methods. When you obtain the container instance in some hooks, you can refer to the knowledge in this section.**

> [!NOTE] Note
> If you need to change the width and height of the container, it is recommended to use the `manager.setArea()` method instead of changing it through `manager.container.setStyle()`. Otherwise, you will need to manually call `manager.format()`.

```ts
declare class Container {
  width: number;
  height: number;
  node: HTMLDivElement;
  parentNode: HTMLElement | null;
  setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]): void;
}
```

## manager.container.width

**Type: `number`**<br/>
**Default: `0`**

The `width` of the container, this value may change after you call `manager.format()`.

## manager.container.height

**Type: `number`**<br/>
**Default: `0`**

The `height` of the container, this value may change after you call `manager.format()`.

## manager.container.node

**Type: `HTMLDivElement`**<br/>
**Default: `div`**

The `DOM` node of the container.

## manager.container.parentNode

**Type: `HTMLElement | null`**<br/>
**Default: `null`**

The parent node of the container, which can be accessed through this property after being set by `manager.mount()`.

## manager.container.setStyle()

**Type: `setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]): void`**

This method can set the style of the container node.

```ts
// So you can set some styles for the container in the following way
manager.container.setStyle('background', 'red');
```
