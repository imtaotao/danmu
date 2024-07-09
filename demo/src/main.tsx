import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/App';
import { mock, initManager } from '@/manager';
import '@/globals.css';

const manager = ((window as any).manager = initManager());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App manager={manager} />
  </React.StrictMode>,
);

mock(manager);
