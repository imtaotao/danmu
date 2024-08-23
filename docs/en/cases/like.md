# Like/Dislike

## Description

When we hover over a danmaku, we might need to perform some actions. This section will guide you through implementing a toolbar that pops up when the mouse hovers over the danmaku, featuring **like** and **dislike** functionalities.

> [!NOTE] Hint
> The components in this section are demonstrated using **React**.

## Developing the Danmaku Component

```tsx {23-24}
import { useState } from 'react';
import { Tool } from './Tool';

export function Danmaku({ danmaku }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      // Pause the danmaku's movement when the mouse enters
      onMouseEnter={() => {
        danmaku.pause();
        setVisible(true);
      }}
      // Resume the danmaku's movement when the mouse leaves
      onMouseLeave={() => {
        // When in a frozen state, do not resume movement
        //  tip: (but this depends on your business requirements)
        if (manager.isFreeze()) return;
        danmaku.resume();
        setVisible(false);
      }}
    >
      {danmaku.data}
      {visible ? <Tool /> : null}
    </div>
  );
}
```

## Developing the Toolbar Component

```tsx {14-15}
export function Tool() {
  // Send `like/dislike` request and store the result in the database
  const send = (type: string) => {
    fetch(
      'http://abc.com/like',
      {
        method: 'POST',
        body: JSON.stringify({ type }),
      },
    );
  }
  return (
    <div>
      <botton onClick={() => send('good')}>like</button>
      <botton onClick={() => send('not-good')}>dislike</button>
    </div>
  );
}
```

## Render Danmaku

```tsx {9}
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
