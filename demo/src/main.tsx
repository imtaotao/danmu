import React from 'react';
import ReactDOM from 'react-dom/client';
import { create } from 'danmu';
import { App } from './app';
import './globals.css';

const manager = create();
console.log(manager);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
