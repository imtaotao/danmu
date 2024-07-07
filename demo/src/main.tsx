import React from 'react';
import ReactDOM from 'react-dom/client';
import { random } from 'aidly';
import { create } from 'danmu';
import type { BarrageValue } from './types';
import { App } from './App';
import './globals.css';

const manager = create<BarrageValue>({
  gap: 20,
  times: [3500, 6500],
  plugin: {
    hooks: {
      $createNode(b) {
        if (!b.node) return;
        b.node.textContent = b.data.value;
        const cs =
          'h-[35px] py-1 px-3 rounded-xl bg-gray-600 text-slate-100 text-center';
        cs.split(' ').forEach((c) => {
          b.node!.classList.add(c);
        });
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
