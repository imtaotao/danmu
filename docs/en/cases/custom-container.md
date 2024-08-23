# Custom Container Styles

## Description

We mainly achieve this through the [**`manager.container.setStyle`**](../reference/manager-properties/#manager-container-setstyle) API.

> [!NOTE] Hint
> The styles set through the official API will only apply to the root node of the container, which is [**`manager.container.node`**](../reference/manager-properties/#manager-container-node).

## Example

```ts {14,24}
import { create } from 'danmu';

// Styles to be added
const styles = {
  background: 'red',
  // .
};

const manager = create({
  plugin: {
    // You can add hooks during initialization
    init(manager) {
      for (const key in styles) {
        manager.container.setStyle(key, styles[key]);
      }
      // You can also add a `className` to the container DOM here
      manager.container.node.classList.add('className');
    },
  },
});

// Or directly call the API
for (const key in styles) {
  manager.container.setStyle(key, styles[key]);
}
```
