import React from 'react';
import ReactDOM from 'react-dom/client';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { enMap } from '@/i18n/en';
import { zhMap } from '@/i18n/zh';
import { App } from '@/App';
import { mock, autoFormat, initManager } from '@/manager';
import '@/globals.css';

// https://github.com/i18next/i18next-browser-languageDetector
// https://www.i18next.com/overview/configuration-options
i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['zh', 'en'],
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: enMap,
      },
      zh: {
        translation: zhMap,
      },
    },
  });

const manager = ((window as any).manager = initManager());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App manager={manager} />
  </React.StrictMode>,
);

mock(manager);
autoFormat(manager);
