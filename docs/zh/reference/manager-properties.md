# manager 属性

> [!NOTE] 单位提示
> 所有参与计算的单位都允许通过表达式来计算，类似 CSS 的 `calc`。
>
> 1. **`number`**：默认单位为 `px`。
> 2. **`string`**：表达式计算。支持（`+`, `-`, `*`, `/`）数学计算，只支持 `%` 和 `px` 两种单位。
>
> ```ts
> manager.setGap('(100% - 10px) / 5');
> ```

## `manager.version`

**类型：`string`**

当前 `danmu` 库的版本。

## `manager.options`

**类型：`ManagerOptions`**

[**`manager.options`**](./manager-configuration)，你可以从这里取到一些初始值并使用。

```ts
console.log(manager.options.durationRange); // [number, number]
```

## `manager.statuses`

**类型：`Record<PropertyKey, unknown>`**

一个记录状态的属性，在内核中没有使用，主要是提供给业务方记录一些状态使用的。默认类型为一个 `Record<PropertyKey, unknown>`，不过你可以在创建 `manager` 的时候传递范型。

```ts {3}
import { create } from 'danmu';

const manager = create<unknown, { background: string }>();

manager.statuses; // 类型为 { background: string }
```

## `manager.trackCount`

**类型：`number`**

当前容器内部轨道的数量。当容器的大小改变后，并且 `format` 之后（你手动调用 `format()` 方法或者调用 `setArea()` 方法），`trackCount` 也会随之改变。

## `manager.pluginSystem`

**类型：`PluginSystem`**

`manager` 的插件系统实例，其 api 可以见 **hooks-plugin**的文档。

https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis

<h2></h2>

**弹幕容器实例上面有以下一些属性和方法，当你在一些钩子里面获取到 container 实例时，可以参考本小节的知识。**

> [!NOTE] 注意事项
> 如果你需要对容器的宽高做更改，建议使用 `manager.setArea()` 方法，而不要通过 `manager.container.setStyle()` 来更改，否则你需要手动调用 `manager.format()`。

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

**类型：`number`**<br/>
**默认值：`0`**

容器的宽度，当你调用 `manager.format()` 后，这个值可能会有变化。

## manager.container.height

**类型：`number`**<br/>
**默认值：`0`**

容器的宽度，当你调用 `manager.format()` 后，这个值可能会有变化。

## manager.container.node

**类型：`HTMLDivElement`**<br/>
**默认值：`div`**

容器的 DOM 节点。

## manager.container.parentNode

**类型：`HTMLElement | null`**<br/>
**默认值：`null`**

容器的父节点，通过 `manager.mount()` 设置后，可以通过此属性拿到。

## manager.container.setStyle()

**类型：`setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]): void`**

这个方法可以设置容器节点的样式。

```ts
// 所以你可以以下方式来给容器设置一些样式
manager.container.setStyle('background', 'red');
```
