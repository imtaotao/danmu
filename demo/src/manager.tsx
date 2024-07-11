import { uuid } from 'aidly';
import ReactDOM from 'react-dom/client';
import { type Manager, create } from 'danmu';
import type { BarrageValue } from '@/types';
import { BarrageBox } from '@/components/danmu/barrage';

export const initManager = () => {
  const manager = create<BarrageValue>({
    trackHeight: 40,
    times: [4000, 7000],
    plugin: {
      init(manager) {
        manager.box.node.classList.add('bg-slate-200');
      },
      $createNode(b) {
        if (!b.node) return;
        ReactDOM.createRoot(b.node).render(
          <BarrageBox manager={manager} barrage={b} />,
        );
      },
    },
  });
  return manager;
};

export const mock = (manager: Manager<BarrageValue>) => {
  const list = [
    '哇塞！',
    '不可思议！',
    '这也太厉害了吧！',
    '惊呆了！',
    '太神奇了！',
    '这是什么操作？',
    '我看到了什么？',
    '这是什么原理？',
    '我有点看不懂了。',
    '这是什么操作？',
  ];
  setInterval(() => {
    for (const content of list) {
      manager.push({
        id: uuid(),
        value: {
          content,
          isSelf: false,
        },
      });
    }
  }, 800);
};
