import { sharedConfig } from './shared.js';
import { zh } from './zh';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { defineConfig } from 'vitepress';

export default (process.env.NODE_ENV === 'production'
  ? withMermaid
  : defineConfig)({
  ...sharedConfig,
  locales: {
    root: { label: '简体中文', lang: 'zh', link: '/zh', ...zh },
  },
});
