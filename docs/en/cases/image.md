# Send Danmaku with Images

## Description

To allow danmaku to carry images, similar to the implementation of the [**like/dislike**](./like) feature, you need to add custom content inside the danmaku node. In fact, it's not just images; you can **add any content** inside the danmaku node.

> [!NOTE] Hint
> The components in this section are demonstrated using **React**.

## Developing the Danmaku Component

```tsx {4-5}
export function Danmaku({ danmaku }) {
  return (
    <div>
      <img src="https://abc.jpg" />
      {danmaku.data}
    </div>
  );
}
```

## Render Danmaku

```tsx title="init.tsx" {9}
import ReactDOM from 'react-dom/client';
import { create } from 'danmu';
import { Danmaku } from './Danmaku';

const manager = create<string>({
  plugin: {
    // Render the component onto the built-in node of the danmaku
    $createNode(danmaku) {
      ReactDOM.createRoot(danmaku.node).render(<Danmaku danmaku={danmaku} />);
    },
  },
});
```
