# Cooldown Time

## Description

In live streaming scenarios, when users send danmaku at a high frequency within a short period, it may appear as spamming. This section provides a simple implementation for such scenarios. You can refer to its principles and ideas to extend it according to your business needs.

> [!NOTE] Hint
> We mainly rely on the [**`willRender`**](../reference/manager-hooks/#hooks-willrender) hook to achieve this.

## Implementation Based on Danmaku Content

```ts {13-23}
import { create } from 'danmu';

const cd = 3000;
const map = Object.create(null);

// Create manager, define the type of danmaku to be sent as string
const manager = create<string>({ ... });

// Write a plugin specifically to handle danmaku cooldown (CD)
manager.use({
  name: 'cd',
  willRender(ref) {
    const now = Date.now();
    const content = ref.danmaku.data;
    const prevTime = map[content];

    if (prevTime && now - prevTime < cd) {
      ref.prevent = true;
      console.warn(`"${content}" is blocked.`);
    } else {
      map[content] = now;
    }
    return ref;
  },
});

// ✔️ Successfully
manager.push('content'); // [!code hl]

// ❌ Blocked
manager.push('content'); // [!code error]

// ✔️ Successfully
setTimeout(() => {
  manager.push('content'); // [!code hl]
}, 3000)
```

## Implementation Based on User ID

```ts {13-23}
import { create } from 'danmu';

// Create manager,
// define the type of danmaku to be sent as `{ userId: number, content: string }`
const manager = create<{ userId: number, content: string }>({ ... });

const cd = 3000;
const map = Object.create(null);

manager.use({
  name: 'cd',
  willRender(ref) {
    const now = Date.now();
    const { userId } = ref.danmaku.data;
    const prevTime = map[userId];

    if (prevTime && now - prevTime < cd) {
      ref.prevent = true;
      console.warn(`"${userId}" is blocked.`);
    } else {
      map[userId] = now;
    }
    return ref;
  },
});

// ✔️ Successfully
manager.push({ useId: 1, content: 'content1' }); // [!code hl]

// ❌ Blocked
manager.push({ useId: 1, content: 'content2' }); // [!code error]

// ✔️ Successfully
setTimeout(() => {
  manager.push({ useId: 1, content: 'content3' }); // [!code hl]
}, 3000)
```
