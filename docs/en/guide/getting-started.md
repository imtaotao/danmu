# Getting Started

> [!NOTE] Tip
> <a href="https://www.npmjs.com/package/danmu">danmu</a> is not yet at version 1.0. Please avoid using undocumented APIs. If you encounter any bugs or unexpected behavior, please <a href="https://github.com/imtaotao/danmu/issues/new">create an issue on GitHub</a>。

`danmu` is a **highly extensible** and **feature-rich** danmaku library that provides developers with easy integration and the ability to write custom plugins. It meets complex requirements while also allowing for extreme customization. We have set up a demo site where you can see some examples in action.

https://imtaotao.github.io/danmu

## 🎯 Why Choose `danmu` ?

Modern video websites often incorporate danmaku, which can enhance the viewing experience in various ways. Creating a functional and feature-rich danmaku library is not an easy task. There are many different danmaku libraries available, but most of them rely on `Canvas` for rendering. This approach limits the styling capabilities and offers little room for extension. Such limitations can be detrimental for future iterations, as switching to a different library would be costly.

The `danmu` uses `CSS + DOM` to render danmaku, which means the movement of danmaku can leverage the browser's native animation capabilities. `CSS + DOM` offers extensive possibilities, allowing for various forms of danmaku (imagine a danmaku embedding a webpage). Additionally, we provide collision detection for danmaku, ensuring that even if the movement speed of danmaku is not fixed, they will not collide with each other.

## 🚀 Quick Start

### 1. Install Dependencies

You can use your preferred package manager to install `danmu` as a dependency in your project, thereby adding Danmaku to your existing project:

::: code-group

```sh [npm]
$ npm install danmu
```

```sh [pnpm]
$ pnpm install danmu
```

```sh [yarn]
$ yarn add danamu
```

:::

We also provide a `CDN` for development and debugging purposes. **Do not use this `CDN` in a production environment**:

```html
<script src="https://unpkg.com/danmu/dist/danmu.umd.js"></script>
```

### 2. Create Manager

The `danmu` core package exposes only a `create` method, which is used to create a `manager` instance. Yes, all our implementations are multi-instance. For the configuration options that can be passed during creation, please refer to the [**Configuration**](../reference/manager-configuration) section.

```ts
import { create } from 'danmu';

// Create a manager instance here. If no configuration is passed,
// the default configuration will be used.
const manager = create({
  trackHeight: '20%',
  plugin: {
    willRender(ref) {
      // Types of Danmaku to be Rendered
      console.log(ref.type);
      // Danmaku Instances to be Rendered
      console.log(ref.danmaku);
      // Set to `true` to prevent rendering.
      // You can perform danmaku filtering here
      ref.prevent = true;
      return ref;
    },
  },
  // .
});
```

### 3. Mount and Render

Once we have created a `manager`, we can mount it to a specific node and render it. In fact, the `manager` internally starts a timer to poll and render the danmaku from the memory area. The polling interval is controlled by you. If not passed through configuration, there is a default value of **`500ms`**, see the [**Configuration**](../reference/manager-configuration) section for details.

```ts
const container = document.getElementById('container');

// Mount and Start Rendering
manager.mount(container).startPlaying();
```

### 4. Send Facile Danmaku

Once the preliminary setup is complete, you can start sending danmaku.

```ts
// The content type of the danmaku can be specified using generics when creating the manager.
// Refer to the later sections for more details.
manager.push('content');
```

However, danmaku sent using the [**`manager.push`**](../reference/manager-api/#manager-push) method may be affected by the danmaku algorithm and may not render immediately. Imagine pushing data into an array, but the consumption happens from the front of the array. We can use the [**`manager.unshift`**](../reference/manager-api/#manager-unshift) method to send danmaku instead.

```ts
// This will render immediately in the next rendering poll.
manager.unshift('content');
```

When initializing the `manager`, you can pass default global plugins through the `plugin` property. These plugins will be effective for all danmaku and include both [**global**](../reference/manager-hooks) and [**danmaku**](../reference/danmaku-hooks) types of hooks.

However, when sending danmaku, you can also pass plugins specific to the danmaku. These do not include global hooks and **are only effective for the currently rendered danmaku**. If needed, this allows you to better control the danmaku being rendered.

```ts
manager.push('content', {
  plugin: {
    moveStart(danmaku) {
      // The moveStart hook is triggered just before the danmaku starts moving.
      // You can change the danmaku's style here.
      danmaku.setStyle(csskey, cssValue);
    },
  },
  // .
});
```

### 5. Send Flexible Danmaku

Facile danmaku will be limited by the collision rendering algorithm. For those danmaku that require special handling, such as top danmaku or danmaku in special positions, you need to send flexible danmaku through the [**`manager.pushFlexibleDanmaku`**](../reference/manager-api/#manager-pushflexibledanmaku) API to render them. Flexible danmaku will not be restricted by the collision algorithm.

```ts
manager.pushFlexibleDanmaku('content', {
  id: 1, // Optional parameters
  duration: 1000, // Defaults to a random value from `manager.options.times`
  direction: 'none', // Defaults to the value of `manager.options.direction`
  position: (danmaku, container) => {
    // This will make the danmaku appear in the center of the container.
    // Since the `direction` is set to `none`, it will remain stationary for `1s`
    return {
      x: `50% - ${danmaku.getWidth() / 2}`, // [!code ++]
      y: `50% - ${danmaku.getHeight() / 2}`, // [!code ++]
    };
  },
  plugin: {
    // The plugin parameter is optional.
    // For details, refer to the hooks for regular danmaku,
    // as they are the same here.
  },
});
```
