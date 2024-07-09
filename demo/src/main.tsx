import React from 'react';
import ReactDOM from 'react-dom/client';
import { random } from 'aidly';
import { create } from 'danmu';
import type { BarrageValue } from './types';
import { App } from '@/App';
import { BarrageBox } from '@/components/custom/barrage';
import './globals.css';

const manager = create<BarrageValue>({
  gap: 20,
  trackHeight: '14%',
  times: [4000, 7000],
  plugin: {
    hooks: {
      $createNode(b) {
        if (!b.node) return;
        ReactDOM.createRoot(b.node).render(<BarrageBox barrage={b} />);
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App manager={manager} />
  </React.StrictMode>,
);

(() => {
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
      manager.push({ value: { content, isSelf: false }, id: random(1000) });
    }
  }, 1000);
})();
