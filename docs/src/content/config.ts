import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { defineCollection } from 'astro:content';
import { blogSchema } from 'starlight-blog/schema';

export const collections = {
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
  docs: defineCollection({
    schema: docsSchema({ extend: (ctx) => blogSchema(ctx) }),
  }),
};
