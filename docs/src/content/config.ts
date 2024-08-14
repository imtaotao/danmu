import { i18nSchema } from '@astrojs/starlight/schema';
import { defineCollection } from 'astro:content';

export const collections = {
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
};
