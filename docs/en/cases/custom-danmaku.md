# Custom Danmaku Styles

## Description

Since we can access the DOM node of the danmaku, it is very convenient to customize CSS styles. This is mainly achieved through the [**`manager.setStyle`**](../reference/manager-api/#manager-setstyle) and [**`danmaku.setStyle`**](../reference/danmaku-api/#danmaku-setstyle) APIs.

> [!NOTE] Hint
> The styles set through the official API will only apply to the root node of the danmaku, which is [**`danmaku.node`**](../reference/danmaku-props/#danmaku-node).

## Setting Styles via `manager.setStyle`

```ts {14}
import { create } from 'danmu';

// Styles to be added
const styles = {
  color: 'red',
  fontSize: '15px',
  // .
};

const manager = create();

// Subsequent rendered danmaku and currently rendered danmaku will have these styles applied.
for (const key in styles) {
  manager.setStyle(key, styles[key]);
}
```

## Setting Styles via `danmaku.setStyle`

In this implementation, you might need to leverage [**`manager.statuses`**](../reference/manager-properties/#manager-statuses) to simplify the implementation in real business scenarios.

```ts {15,26}
import { create } from 'danmu';

// Styles to be added
const styles = {
  color: 'red',
  fontSize: '15px',
  // .
};

// Add hooks during initialization so that new danmaku will automatically have these styles applied when rendered
const manager = create({
  plugin: {
    $beforeMove(danmaku) {
      for (const key in styles) {
        danmaku.setStyle(key, styles[key]);
      }
      // You can also add a `className` to the container DOM here
      danmaku.node.classList.add('className');
    },
  },
});

// Add styles to the currently rendered danmaku
manager.asyncEach((danmaku) => {
  for (const key in styles) {
    danmaku.setStyle(key, styles[key]);
  }
});
```
