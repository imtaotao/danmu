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
    'Imtaotao',
    'Supertaotao',
    'I can see it',
    'Do you feel alright?',
    'Yes, I feel wonderfull tonight',
    "Tell me someday we'll get together",
  ];
  setInterval(() => {
    for (const value of list) {
      manager.push({ value, id: random(1000) });
    }
  }, 500);
})();
