# Filter Keywords

## Description

The implementation of the keyword filtering feature has already been covered in the [**Writing Plugins**](../guide/create-plugin) chapter.

> [!NOTE] Hint
> The implementation of keyword filtering also relies on the [**`willRender`**](../reference/manager-hooks/#hooks-willrender) hook.

## Example

```ts {4,12}
import { create } from 'danmu';

// Define the keyword list
const keywords = ['a', 'c', 'e'];

// Create `manager`, define the type of danmaku to be sent as `string`
const manager = create<string>({
  plugin: {
    willRender(ref) {
      for (const word of keywords) {
        if (ref.danmaku.data.includes(word)) {
          ref.prevent = true;
          break;
        }
      }
      return ref;
    },
  },
});

// ❌ Will be filtered
manager.push('ab'); // [!code error]

// ✔️ Will not be filtered
manager.push('bd'); // [!code hl]
```
