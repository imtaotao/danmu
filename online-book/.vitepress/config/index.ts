import { sharedConfig } from './shared.js';
import { jaConfig } from './ja';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { defineConfig } from 'vitepress';

export default (process.env.NODE_ENV === 'production'
  ? withMermaid
  : defineConfig)({
  ...sharedConfig,
  locales: {
    root: { label: 'Japanese', lang: 'ja', link: '/', ...jaConfig },
  },
});
