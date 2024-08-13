import { uuid } from 'aidly';
import { t } from 'i18next';
import ReactDOM from 'react-dom/client';
import { type Manager, create } from 'danmu';
import type { Statuses, DanmakuValue } from '@/types';
import { DanmakuComponent } from '@/components/danmu/Danmaku';

export const initManager = () => {
  const manager = create<DanmakuValue, Statuses>({
    trackHeight: 40,
    times: [4000, 7000],
    plugin: {
      init(manager) {
        'shadow shadow-slate-200 bg-slate-100'.split(' ').forEach((c) => {
          manager.container.node.classList.add(c);
        });
      },
      $createNode(d) {
        if (!d.node) return;
        ReactDOM.createRoot(d.node).render(
          <DanmakuComponent manager={manager} danmaku={d} />,
        );
      },
    },
  });
  return manager;
};

export const mock = (manager: Manager<DanmakuValue>) => {
  setInterval(() => {
    for (let i = 0; i < 10; i++) {
      manager.push(
        {
          isSelf: false,
          content: t(`mockDanmuContent${i}`),
        },
        { id: uuid() },
      );
    }
  }, 1000);
};
