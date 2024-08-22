# Simplified Mode

## Description

In video and live streaming scenarios, due to the need for real-time rendering, rendering too many danmaku can cause page lag. Here are two methods to address this:

- Implement a simplified danmaku mode.
- Set [**`limits.view`**](../reference/manager-configuration/#config-limits) to limit the number of rendered danmaku.

> [!NOTE] Hint
> Similar to implementing the danmaku cooldown feature, the simplified danmaku mode is also achieved by relying on the [**`willRender`**](../reference/manager-hooks/#hooks-willrender) hook.

## Implementation Using Simplified Danmaku Mode

```ts {10}
import { random } from 'aidly';
import { create } from 'danmu';

const manager = create<string>({
  plugin: {
    // Compared to implementing danmaku cooldown, as an alternative implementation,
    // directly insert the default plugin during initialization
    willRender(ref) {
      // We filter out 50% of the danmaku
      if (random(0, 100) < 50) {
        ref.prevent = true;
      }
      return ref;
    },
  },
});
```

## Implementation by Setting `limits.view`

```ts {7}
import { create } from 'danmu';

const manager = create<string>({
  limits: {
    // In the page view container,
    // the maximum number of items that can be simultaneously rendered is `100`.
    view: 100,
  },
});
```
