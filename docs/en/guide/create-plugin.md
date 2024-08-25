# Writing Plugins

Writing a plugin is very simple, but with the hooks and APIs exposed by the kernel, you can easily achieve powerful and customized requirements.

## Description

Since the kernel does not expose the functionality to **filter danmaku based on conditions**, the reason being that the kernel does not know the data structure of the danmaku content, which is highly related to business requirements, we will demonstrate the **simplified danmaku** functionality through a plugin.

## 💻 Writing a Plugin

> [!NOTE] Tip
>
> - Your plugin should have a `name` for debugging and troubleshooting purposes (make sure it does not conflict with other plugins).
> - A plugin can optionally declare a `version`, which is useful if you publish your plugin as a standalone package on `npm`.

```ts {11,15}
export function filter({ userIds, keywords }) {
  return (manager) => {
    return {
      name: 'filter-keywords-or-user',
      version: '1.0.0', // The `version` field is not mandatory.
      willRender(ref) {
        const { userId, content } = ref.danmaku.data.value;
        // `ref.type` is used to distinguish between facile danmaku and flexible danmaku.
        console.log(ref.type);

        if (userIds && userIds.includes(userId)) {
          ref.prevent = true;
        } else if (keywords) {
          for (const word of keywords) {
            if (content.includes(word)) {
              ref.prevent = true;
              break;
            }
          }
        }
        return ref;
      },
    };
  };
}
```

## 🛠️ Register Plugin

You need to register the plugin using `manager.use()`.

```ts {9-12}
import { create } from 'danmu';

const manager = create<{
  userId: number;
  content: string;
}>();

manager.use(
  filter({
    userIds: [1],
    keywords: ['bad'],
  }),
);
```

## 💬 Send Danmaku

- ❌ **Will** be blocked from rendering by the plugin

```ts {2}
manager.push({
  userId: 1,
  content: '',
});
```

- ❌ **Will** be blocked from rendering by the plugin

```ts {3}
manager.push({
  userId: 2,
  content: "You're really bad",
});
```

- ✔️ **Will not** be blocked from rendering by the plugin

```ts {2}
manager.push({
  userId: 2,
  content: '',
});
```

- ✔️ **Will not** be blocked from rendering by the plugin

```ts {3}
manager.push({
  userId: 2,
  content: "You're awesome",
});
```
