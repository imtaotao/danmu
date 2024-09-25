import { uuid } from 'aidly';
import { t } from 'i18next';
import ReactDOM from 'react-dom/client';
import { type Manager, create } from 'danmu';
import type { Statuses, DanmakuValue } from '@/types';
import { DanmakuComponent } from '@/components/danmu/Danmaku';

export const initManager = () => {
  const manager = create<DanmakuValue, Statuses>({
    interval: 500,
    trackHeight: 40,
    durationRange: [10000, 13000],
    plugin: {
      init(manager) {
        'shadow shadow-slate-200 bg-slate-100'.split(' ').forEach((c) => {
          manager.container.node.classList.add(c);
        });
      },
      $createNode(dm) {
        if (!dm.node) return;
        ReactDOM.createRoot(dm.node).render(
          <DanmakuComponent manager={manager} danmaku={dm} />,
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
  }, 1500);
};

export const autoFormat = (manager: Manager<DanmakuValue>) => {
  const resizeObserver = new ResizeObserver(() => manager.format());
  resizeObserver.observe(document.body);
};
